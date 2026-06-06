# Site Reliability Engineering (SRE) Runbook

This document defines the operational procedures, metrics boundaries, disaster recovery scenarios, and alert resolution workflows.

---

## 📊 Reliability Metrics (SLAs / SLOs / SLIs)

| Metric | Service Level Indicator (SLI) | Service Level Objective (SLO) | Service Level Agreement (SLA) |
|---|---|---|---|
| **Availability** | Ratio of HTTP 2xx/3xx/4xx response codes over total HTTP requests. | **>= 99.99%** over any 30-day window | **99.9%** (Refund-eligible threshold) |
| **Latency** | Network transit time for client request processing (p99 duration). | **< 500ms** for 99% of requests over 5m | **< 1500ms** for 99% of requests |
| **Build Integrity**| Rate of successful GitHub Actions branch merge deployments. | **100%** successful compiles on main branch | N/A |

---

## 🚨 Active Alert Resolution Playbooks

### Alert: `FrontendSlaBreached` (Critical)
* **Description:** The 5xx response error rate exceeds 0.01% over a 5-minute interval.
* **Immediate Response Steps:**
  1. **Check Nginx Pod Logs:**
     ```bash
     kubectl logs -n portfolio -l app=portfolio-website --tail=100
     ```
  2. **Inspect Upstream / Resource Stress:** Determine if pods are running out of memory (OOMKilled) or suffering CPU throttling:
     ```bash
     kubectl top pods -n portfolio
     ```
  3. **Trigger Rollback:** If a recent deployment caused the failure, instantly initiate a rollback (see Rollback Procedures below).

### Alert: `HighResponseLatency` (Warning)
* **Description:** The p99 latency metric has exceeded 500ms over a 5-minute window.
* **Response Steps:**
  1. **Identify Traffic Spikes:** Check the request volume graph in Grafana. If traffic is abnormally high, verify that the Horizontal Pod Autoscaler is scale-out active:
     ```bash
     kubectl get hpa -n portfolio
     ```
  2. **Audit Cache Hits:** Verify if CloudFront CDN is returning `Miss from cloudfront` headers due to invalid query string configurations.

### Alert: `PodInstanceDown` (Critical)
* **Description:** Running container replica counts are lower than the expected count of 3.
* **Response Steps:**
  1. **Inspect Pod Status:**
     ```bash
     kubectl get pods -n portfolio
     ```
  2. **Check Desired vs Available Replicas:** If pods are in `CrashLoopBackOff` or `Pending` state, run `kubectl describe` to find out why:
     ```bash
     kubectl describe pod <pod-id> -n portfolio
     ```

---

## 🔄 Deployment Rollback Procedures

### Containerized Helm Deployment Rollback
If a Helm release introduces broken dependencies or site-wide downtime:
1. **List Release Revisions:**
   ```bash
   helm history portfolio -n portfolio
   ```
2. **Execute Rollback to Last Stable Revision:**
   ```bash
   helm rollback portfolio <revision-number> -n portfolio
   ```
3. **Verify Deployment Health:**
   ```bash
   kubectl get pods -n portfolio -w
   ```

### Git-Level Workaround (Static Pages)
If GitHub Pages fails due to a commit merge:
1. **Locate Last Stable Commit Hash:** Find the hash using `git log`.
2. **Reset Main Branch Externally:**
   ```bash
   git revert HEAD --no-edit
   # Or reset to specific commit and force push:
   git reset --hard <stable-commit-hash>
   git push origin main --force
   ```
3. **Monitor GitHub Actions Pipeline:** Access the repository page, view the Actions workflow runner, and verify completion of `Deploy Portfolio to GitHub Pages`.

---

## 💾 Backup & Recovery Protocols

### S3 Static Assets Storage Backups
Although static assets are code-compiled directly from git, automated S3 storage buckets versioning is active.
1. **Recover Accidentally Deleted Assets:** Access the AWS S3 Console, locate the bucket `pradeep-portfolio-production-assets`, enable "Show versions", select the file, and delete the `Delete Marker` version metadata.
2. **Disaster Recovery (DR) Region Failover:** The S3 bucket replicates objects to the backup region `us-west-2` automatically. Update the CloudFront DNS record mapping to the fallback bucket region to restore.
