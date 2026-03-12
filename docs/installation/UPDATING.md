# Update Vane to the latest version

To update Vane to the latest version, follow these steps:

## For Docker users (Using pre-built images)

Simply pull the latest image and restart your container:

```bash
docker pull itzcrazykns1337/vane:latest
docker stop vane
docker rm vane
docker run -d -p 3000:3000 -v vane-data:/home/vane/data --name vane itzcrazykns1337/vane:latest
```

For Tavily search:

```bash
docker pull itzcrazykns1337/vane:latest
docker stop vane
docker rm vane
docker run -d -p 3000:3000 -e TAVILY_API_KEY=your_key -v vane-data:/home/vane/data --name vane itzcrazykns1337/vane:latest
```

Once updated, go to http://localhost:3000 and verify the latest changes. Your settings are preserved automatically.

## For Docker users (Building from source)

1. Navigate to your Vane directory and pull the latest changes:

   ```bash
   cd Vane
   git pull origin master
   ```

2. Rebuild the Docker image:

   ```bash
   docker build -t vane .
   ```

3. Stop and remove the old container, then start the new one:

   ```
   docker stop vane
   docker rm vane
   docker run -p 3000:3000 -e TAVILY_API_KEY=your_key --name vane vane
   ```

4. Once the command completes, go to http://localhost:3000 and verify the latest changes.

## For non-Docker users

1. Navigate to your Vane directory and pull the latest changes:

   ```bash
   cd Vane
   git pull origin master
   ```

2. Install any new dependencies:

   ```bash
   pnpm i
   ```

3. Rebuild the application:

   ```bash
   pnpm run build
   ```

4. Restart the application:

   ```bash
   pnpm run start
   ```

5. Go to http://localhost:3000 and verify the latest changes. Your settings are preserved automatically.

---
