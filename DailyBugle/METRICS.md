## 5 Important Metrics to track for the Daily Bugle:

1. HTTP Request Response Time
This measures The amount of time (in milliseconds) it takes for each microservice to process an incoming request and send a response back to the client.

I would install a middleware library in your my node.js/express servers to track this. The middleware records the timestamp when a request hits the server (req) and when the response finishes, calculating the difference. This data would be exposed by a metrics endpoint that a tool like Prometheus scrapes every 15 seconds, storing the values in a time-series database.

We track this to improve user experience. If an article is taking a minute to load, users will leave the site. High latency also indicates inefficient code or network issues.

2. HTTP Error Rate (Status Codes)
This measures the percentage of requests that fail. This is split into 4xx errors (Client errors) and 5xx errors (Server errors).

I would collect data in server.js for each microservice, and use a middleware that listens for the res.on('finish') event and checks res.statusCode. I would increment a counter in memory. A tool like Prometheus scrapes this counter. Alternatively, log these errors to stdout, and a log aggregator parses and stores them.

We track this metric to ensure reliability. A spike in errors would mean the application is broken.

3. Ad Click-Through Rate
This measures the ratio of Ad "Interactions" (clicks) to Ad "Impressions" (views).

This data is already being saved in my MongoDB adevents collection. I would would write a scheduled script (CronJob) inside Kubernetes that runs a MongoDB Aggregation pipeline every hour. It counts documents where eventType: 'interaction' and divides by eventType: 'impression'. The result is stored in a separate analytics collection.

We track this to measure conversions on advertisements. Since the Daily Bugle relies on ads, you need to know if the ads are effective. If impressions happen but clicks are zero, your UI might be broken or the ads are not effective.

4. Kubernetes Pod Restarts
This measures many times the containers for your services have crashed and been restarted by Kubernetes.

Kubernetes tracks this natively using a tool called kube-state-metrics which runs inside the cluster. It queries the Kubernetes API server and exports the kube_pod_container_status_restarts_total metric to Prometheus.

We track this to understand application stability. If we have a bug that causes occasional crashes, the pod will crash and restart instantly. A restart count tells you that your code is unstable and crashing in the background.

5. Database Connection Pool Usage
This measures the number of active connections your Node.js services have open to MongoDB Atlas compared to the maximum allowed limit.

Mongoose has internal monitoring. I can listen to connection events (mongoose.connection.on('stats')) or check mongoose.connection.base.connections.length. The Node.js app exposes this number on a /metrics endpoint to be scraped and stored by Prometheus.

We track this to know how many user sessions are open and for scalability. Since I use MongoDB Atlas, there is a strict limit on how many connections at once. Monitoring this warns you before you hit that wall.