# Simple-Node-App Demo
# GitHub Actions Demo
Simple NodeJs app build using Express API exposing only / & /hello endpoints to demonstrate the use of:
1. Docker - Build a containerized app image.
2. Docker Hub - Publish & tag image in Docker Hub
3. Kubernetes - Deploy the application in a Kubernetes Cluster.
4. Google Kubernetes Engine (GKE) - Deploy the app in GKE Cluster in a Production-like environment.

## Links
- [Project Repository](https://github.com/imranKpathan/simple-node-app "Simple Node App Repo")
- [Github Actions workflow for this project](https://github.com/imranKpathan/simple-node-app/actions/workflows/github-actions-workflow.yaml)
- [Docker Hub Registry for this project](https://hub.docker.com/repository/docker/imrankpathan/simple-node-app "Link to Docker Hub Registry")
- [GKE Kubernetes Cluster](https://console.cloud.google.com/kubernetes/clusters/details/asia-south1-a/simple-node-app/details?project=simple-node-app-357305 "Link to GKE Cluster")
## Built With
- [NodeJS](https://code.visualstudio.com/docs/nodejs/nodejs-tutorial "NodeJS")
- [ExpressApi](https://expressjs.com/en/starter/hello-world.html "Express API")
## Description
This project is to demonstrate building a NodeJS “Hello World” web application and deploy it to a Kubernetes cluster. To build this project follow the steps given below:
### Build:
* Create and use a Dockerfile to build a containerized image for this app.
```
docker build -t imrankpathan/simple-node-app .
```
### Publish Image to Docker Hub:
* Push a new version of the image to Docker Hub.
```
docker push imrankpathan/simple-node-app
```
### Publish:
* Sets project version to next version determined in Initialization stage.
* Publishes application to GitHub packages.
### Local Build & Testing:
#### With Docker:
* Run Docker image
```
docker run -d -p 8080:8080 --name simple-node-app imrankpathan/simple-node-app
```
* Test Container and app are working as expected:
```
Launch browser and connect to http://localhost:8080/hello
```
#### With Kubernetes (In-Built in Docker Desktop for Windows):
* Create app deployment config file.
* Create ClusterIP service config file.
* Create Ingress service config file.

_NOTE: All config files are available in k8s folder._

* Apply App Deployment:
```
kubectl apply -f k8s/simple-node-app-deployment.yaml
```
* Apply ClusterIP service:
```
kubectl apply -f k8s/simple-node-app-cluster-ip-service.yaml
```
* Apply Ingress service:
```
kubectl apply -f k8s/simple-node-app-ingress-service.yaml
```
* Install Ingress controller:
```
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.3.0/deploy/static/provider/cloud/deploy.yaml
```
* Test app is working as expected.
```
Launch browser and connect to http://localhost/hello
```
### Set up CI using GitHub actions workflow.
```Workflow
name: Simple Node App Actions Workflow
on:
  workflow_dispatch:
  push:
    branches: [ "main" ]

env:
  PROJECT_ID: ${{ secrets.GKE_PROJECT }}
  GKE_CLUSTER: simple-node-app    # GKE cluster name
  GKE_ZONE: asia-south1-a 	   # GKE cluster zone
  DEPLOYMENT_NAME: simple-node-app-deployment # deployment name if changed in deployment.yaml  
  GKE_SA_KEY: ${{ secrets.GKE_SA_KEY }}

jobs:
  Initialization:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Use Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '12.x'
      - run: npm install
      - run: npm run build --if-present
      - run: npm test
  Build_Docker_Image:
    runs-on: ubuntu-latest
    needs: [Initialization]
    steps:
      - name: Login to DockerHub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}
      - name: Build and push Docker Image
        uses: docker/build-push-action@v3.1.0
        with:
          push: true
          tags: imrankpathan/simple-node-app:latest, imrankpathan/simple-node-app:${{github.run_number}}
  Deploy_To_GKE_Cluster:
    runs-on: ubuntu-latest
    needs: [Build_Docker_Image]
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Get GKE Cluster Credentials
        uses: google-github-actions/get-gke-credentials@v0
        with:
          cluster_name: ${{ env.GKE_CLUSTER }}
          location: ${{ env.GKE_ZONE }}
          credentials: ${{ env.GKE_SA_KEY }}      
      - name: Deploy
        run: kubectl apply -f ./k8s
      - name: Set Image Version kubectl
        run: kubectl set image deployments/simple-node-app-deployment simple-node-app=imrankpathan/simple-node-app:${{github.run_number}}
      - name: Test API Deployment status
        run: |-
          kubectl rollout status deployment/${{env.DEPLOYMENT_NAME}}
          kubectl get services -o wide
```
### Deployment to Google Cloud Kubernetes Engine:
<img width="637" alt="image" src="https://user-images.githubusercontent.com/12246571/180670564-fc32c0cc-aeef-41fc-9048-db845e6de90b.png">

* Set up a project in Google Cloud. [GCP Creating & Managing Projects](https://cloud.google.com/resource-manager/docs/creating-managing-projects "GCP Creating & Managing Projects")
* Create a GKE Cluster [Creating a GKE Cluster](https://cloud.google.com/kubernetes-engine/docs/how-to/creating-a-zonal-cluster "Creating a GKE Cluster")
* Set up a service account in GKE [Creating Service Accounts](https://cloud.google.com/iam/docs/creating-managing-service-accounts "Creating Service Accounts")
* Set up service account key in IAM. [Creating service account keys](https://cloud.google.com/iam/docs/creating-managing-service-account-keys "Creating service account keys")
* Add key & other Cluster details to Github secrets.
* Launch Cloud console in the GKE Cluster to Install Helm & create Ingress Controllers. [Install Helm](https://helm.sh/docs/intro/install/#from-script "Install Helm") & [Install ingress-nginx](https://kubernetes.github.io/ingress-nginx/deploy/#quick-start "Install ingress-nginx")
* Run GitHub actions workflow which will create and push a new Docker image, apply the deployment and required services. [GitHub Actions Workflow](https://github.com/imranKpathan/simple-node-app/actions/workflows/github-actions-workflow.yaml)
* Get External facing IP in GKE and Test by launching bowser.
