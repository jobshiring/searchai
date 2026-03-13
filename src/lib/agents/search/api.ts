import { ResearcherOutput, SearchAgentInput } from './types';
import SessionManager from '@/lib/session';
import { classify } from './classifier';
import Researcher from './researcher';
import { getWriterPrompt } from '@/lib/prompts/search/writer';
import { WidgetExecutor } from './widgets';
import generateSuggestions from '../suggestions';
import crypto from 'crypto';
import { searchTavily } from '@/lib/tavily';

class APISearchAgent {
  async searchAsync(session: SessionManager, input: SearchAgentInput) {
    const classification = await classify({
      chatHistory: input.chatHistory,
      enabledSources: input.config.sources,
      query: input.followUp,
      llm: input.config.llm,
    });

    const widgetPromise = WidgetExecutor.executeAll({
      classification,
      chatHistory: input.chatHistory,
      followUp: input.followUp,
      llm: input.config.llm,
    }).catch((err) => {
      console.error(`Error executing widgets: ${err}`);
      return [];
    });

    let searchPromise: Promise<ResearcherOutput> | null = null;

    // In 'search' mode, we prioritize a direct, clean search experience like Google/Bing.
    // We use the raw user query to avoid AI-induced changes to the search results.
    const isSearchMode = input.config.searchMode === 'search' && !classification.classification.skipSearch;

    if (isSearchMode) {
      console.log('Using direct path for search mode');
      const searchTavilyWrapper = async (): Promise<ResearcherOutput> => {
        const page = input.config.page || 1;
        // Use raw query for the first attempt to keep it "clean"
        const query = input.followUp;
        
        const res = await searchTavily(query, {
          max_results: 20,
          search_depth: input.config.mode === 'speed' ? 'ultra-fast' : 'basic',
        });
        
        const findings = res.results.map((r: any) => ({
          content: r.content || r.title,
          metadata: {
            title: r.title,
            url: r.url,
          },
        }));

        // Manually emit the results as a 'source' block for consistency with Researcher
        session.emitBlock({
          id: crypto.randomUUID(),
          type: 'source',
          data: findings,
        });

        // Manually emit 'searchResults' for pagination data
        session.emit('data', {
          type: 'searchResults',
          data: findings,
          page: page,
          totalResults: res.totalResults,
          hasMore: res.totalResults > page * 10,
        });

        return {
          findings: [],
          searchFindings: findings,
        };
      };
      searchPromise = searchTavilyWrapper();
    } else if (!classification.classification.skipSearch) {
      const researcher = new Researcher();
      searchPromise = researcher.research(SessionManager.createSession(), {
        chatHistory: input.chatHistory,
        followUp: input.followUp,
        classification: classification,
        config: input.config,
      });
    }

    const [widgetOutputs, searchResults] = await Promise.all([
      widgetPromise,
      searchPromise,
    ]);

    if (searchResults) {
      const searchMode = input.config.searchMode || 'ai';
      const page = input.config.page || 1;
      const pageSize = 10;

      if (searchMode === 'search') {
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const pagedFindings = searchResults.searchFindings.slice(start, end);

        session.emit('data', {
          type: 'searchResults',
          data: pagedFindings,
        });

        session.emit('data', {
          type: 'researchComplete',
        });

        // Generate suggestions for search mode
        const suggestions = await generateSuggestions(
          { chatHistory: input.chatHistory },
          input.config.llm,
        );

        session.emit('data', {
          type: 'block',
          block: {
            id: crypto.randomBytes(7).toString('hex'),
            type: 'suggestion',
            data: suggestions,
          },
        });

        session.emit('end', {});
        return;
      }

      session.emit('data', {
        type: 'searchResults',
        data: searchResults.searchFindings,
      });
    }

    session.emit('data', {
      type: 'researchComplete',
    });

    const finalContext =
      searchResults?.searchFindings
        .slice(0, 8) // Limit to top 8 search findings to avoid hitting token limits (e.g. Groq TPM)
        .map(
          (f, index) =>
            `<result index=${index + 1} title=${f.metadata.title}>${
              f.content.length > 1500 ? f.content.slice(0, 1500) + '...' : f.content
            }</result>`,
        )
        .join('\n') || '';

    const widgetContext = widgetOutputs
      .map((o) => {
        return `<result>${o.llmContext}</result>`;
      })
      .join('\n-------------\n');

    const finalContextWithWidgets = `<search_results note="These are the search results and assistant can cite these">\n${finalContext}\n</search_results>\n<widgets_result noteForAssistant="Its output is already showed to the user, assistant can use this information to answer the query but do not CITE this as a souce">\n${widgetContext}\n</widgets_result>`;

    const writerPrompt = getWriterPrompt(
      finalContextWithWidgets,
      input.config.systemInstructions,
      input.config.mode,
    );

    const answerStream = input.config.llm.streamText({
      messages: [
        {
          role: 'system',
          content: writerPrompt,
        },
        ...input.chatHistory,
        {
          role: 'user',
          content: input.followUp,
        },
      ],
    });

    for await (const chunk of answerStream) {
      session.emit('data', {
        type: 'response',
        data: chunk.contentChunk,
      });
    }

    session.emit('end', {});
  }
}

export default APISearchAgent;
