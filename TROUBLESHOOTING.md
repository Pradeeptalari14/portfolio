# Operational Troubleshooting Guide

This guide describes the actions required to resolve common runtime, deployment, build, and infrastructure failures.

---

## 🌐 1. Client-Side & Browser Issues

### Issues: Layout shifts, cards missing on loading, or old assets showing
* **Cause:** Browser-side caching of local storage templates or outdated Service Worker files.
* **Resolution Steps:**
  1. Open DevTools in your browser (F12) -> Go to **Application** tab -> Click **Clear site data** to wipe local cache and cookies.
  2. Inspect active Service Workers under **Application -> Service Workers** -> Click **Unregister**.
  3. Reload the page using **Ctrl + F5** (Hard Reload).

### Issues: CORS block failures on local JSON requests
* **Cause:** Executing `index.html` file path directly (`file:///...`) instead of mounting on a local server.
* **Resolution Steps:**
  1. Always launch the application using local servers:
     ```bash
     npm run dev
     ```
  2. Vite will serve assets on [http://localhost:5173](http://localhost:5173), resolving local CORS request limits.

---

## 🐳 2. Containerized Deployment Errors

### Issues: Docker container fails to start or Nginx prints permission errors
* **Cause:** Ports conflict or container security context permissions issues.
* **Resolution Steps:**
  1. **Check port conflicts:** Verify if port 80 is occupied:
     ```bash
     docker ps -a
     # Run Docker container mapping to another host port
     docker run -d -p 8080:80 pradeep-portfolio:latest
     ```
  2. **View container logs:**
     ```bash
     docker logs portfolio-site
     ```

---

## ☸️ 3. Kubernetes / Ingress Failures

### Issues: Pod status is `CrashLoopBackOff` or `Pending`
* **Cause:** Resource limit constraints, missing secrets, or scheduling issues.
* **Resolution Steps:**
  1. Check CPU/Memory constraints. If Memory limit is too low for bundling, increase requests/limits inside `deployment.yaml`.
  2. Check pod event description:
     ```bash
     kubectl describe pod <pod-name> -n portfolio
     ```
  3. Inspect logs:
     ```bash
     kubectl logs <pod-name> -n portfolio --previous
     ```

### Issues: HTTP 502 Bad Gateway / Ingress returns 404
* **Cause:** Service selector label mismatch or SSL configuration blocks.
* **Resolution Steps:**
  1. Verify the Service selector maps perfectly to the Deployment labels:
     ```bash
     kubectl get ep portfolio-service -n portfolio
     ```
     Ensure that the endpoint list is not empty.
  2. Verify that Ingress host rules target `talaripradeep.info` or match your cluster ingress configuration.
