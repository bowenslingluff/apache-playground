## 🟢 Kubernetes Deployment
Start Docker Desktop: Ensure the Docker engine is running.

Create the Cluster (If you deleted it):

```bash
kind create cluster --name dailybugle
```

(If you didn't delete the cluster yesterday, skip this).

### Install the App (If starting fresh):

```bash
### 1. Build images
docker build -t bugle-auth:v1 ./back/auth
docker build -t bugle-articles:v1 ./back/articles
docker build -t bugle-ads:v1 ./back/ads
docker build -t bugle-front:v1 ./front

### 2. Load images
kind load docker-image bugle-auth:v1 --name dailybugle
kind load docker-image bugle-articles:v1 --name dailybugle
kind load docker-image bugle-ads:v1 --name dailybugle
kind load docker-image bugle-front:v1 --name dailybugle

### 3. Install Chart
helm install dailybugle ./dailybugle-chart \
  --set env.mongoUri="YOUR_REAL_MONGO_URI" \
  --set env.jwtSecret="YOUR_REAL_SECRET"
```

Open the Connection: Run your script to open the "side windows" to your services:
```bash
./connect.sh
```
Access: Go to http://localhost:8080.

### 🔄 How to UPDATE the App
If you change code, it will not update automatically. You must follow this cycle:

Edit your code.

Rebuild the specific image (Give it a new version tag, e.g., v2):

```Bash
docker build -t bugle-front:v2 ./front
```
Load the new image into the cluster:

```Bash
kind load docker-image bugle-front:v2 --name dailybugle
```
Tell Helm to upgrade:

```Bash
# We pass the new image tag AND the secrets
helm upgrade dailybugle ./dailybugle-chart \
  --set services.frontend.image=bugle-front:v2 \
  --set env.mongoUri="YOUR_REAL_MONGO_URI" \
  --set env.jwtSecret="YOUR_REAL_SECRET"
```
Kubernetes will gracefully kill the old v1 pod and start the new v2 pod.

### 🔴 How to STOP the App
Stop Connections: Press CTRL+C in the terminal running ./connect.sh.

Save Resources (Optional): If you want to free up your computer's RAM, delete the cluster. It takes seconds to recreate it next time.

```Bash
kind delete cluster --name dailybugle
```
If you don't delete it, it will keep running in the background of Docker Desktop

## 🟢 Docker Only Deployment
Start Docker Desktop: Ensure the Docker engine is running.

Run the following command at root folder:
```bash
docker-compose up --build
```

### 🔴 How to STOP the App
Press Ctrl+C in the terminal running docker-compose.

Then run:
```bash
docker-compose down
```