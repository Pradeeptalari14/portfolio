// Go SRE Utility Studio Compiler & Generator
// Copyright (c) 2026 Talari Pradeep. All Rights Reserved.

function initGoConfig() {
  const $ = (id) => document.getElementById(id);
  const $$ = (sel) => document.querySelectorAll(sel);

  let activeTab = 'script';
  const SCRIPT_VERSION = '2.0.0';

  const compiledCode = {
    script: '',
    requirements: '', // go.mod
    makefile: '',
    dockerfile: '',
    readme: '',
    runbook: '',
    flow: ''
  };

  function compileGo() {
    const purpose = $('script_purpose').value;
    const webhook = $('alert_webhook').value.trim();
    const concurrency = parseInt($('concurrency_limit').value) || 5;
    const timeout = parseInt($('request_timeout').value) || 5;
    const panicRecover = $('go_panic_recover').checked;
    const structuredLogging = $('go_structured_logging').checked;

    let code = `// Package main implements a high-performance Go SRE utility daemon.
// Generated dynamically by Go SRE Utility Studio v${SCRIPT_VERSION}.
package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"sync"
	"time"
`;

    // Import packages conditionally based on task
    if (purpose === 'concurrent_pinger') {
      code += `	"bytes"\n	"net/url"\n`;
    } else if (purpose === 'log_parser') {
      code += `	"bufio"\n	"regexp"\n	"bytes"\n`;
    } else if (purpose === 'pod_watcher') {
      code += `	"path/filepath"\n	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"\n	"k8s.io/client-go/kubernetes"\n	"k8s.io/client-go/rest"\n	"k8s.io/client-go/tools/clientcmd"\n`;
    } else if (purpose === 'metrics_exporter') {
      code += `	"math/rand"\n`;
    }

    if (structuredLogging) {
      code += `	"log/slog"\n`;
    } else {
      code += `	"log"\n`;
    }

    code += `)\n\n`;

    // Global structures and alert dispatcher
    code += `// WebhookPayload represents the standard Slack/Teams webhook alert format.
type WebhookPayload struct {
	Text string \`json:"text"\`
}

// dispatchAlert sends a post message payload to a webhook or logs it.
func dispatchAlert(msg string) {
	webhookURL := "${webhook}"
	if webhookURL == "" || webhookURL == "https://hooks.slack.com/services/T000/B000/XXXXXX" {
		`;
    if (structuredLogging) {
      code += `slog.Warn("Alert triggered (webhook omitted):", "message", msg)\n`;
    } else {
      code += `log.Printf("[ALERT] Triggered (webhook omitted): %s", msg)\n`;
    }
    code += `		return
	}

	payload := WebhookPayload{Text: fmt.Sprintf("🚨 *Go SRE Alert* [%s]:\\n%s", time.Now().Format(time.RFC3339), msg)}
	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		`;
    if (structuredLogging) {
      code += `slog.Error("Failed to marshal webhook payload", "error", err)\n`;
    } else {
      code += `log.Printf("[ERROR] Webhook payload marshal failed: %v", err)\n`;
    }
    code += `		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, "POST", webhookURL, bytes.NewBuffer(payloadBytes))
	if err != nil {
		`;
    if (structuredLogging) {
      code += `slog.Error("Failed to create webhook request", "error", err)\n`;
    } else {
      code += `log.Printf("[ERROR] Webhook request init failed: %v", err)\n`;
    }
    code += `		return
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		`;
    if (structuredLogging) {
      code += `slog.Error("Failed to dispatch alert webhook", "error", err)\n`;
    } else {
      code += `log.Printf("[ERROR] Webhook call failed: %v", err)\n`;
    }
    code += `		return
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		`;
    if (structuredLogging) {
      code += `slog.Error("Webhook endpoint returned failure status", "status", resp.Status)\n`;
    } else {
      code += `log.Printf("[WARN] Webhook endpoint status code: %s", resp.Status)\n`;
    }
    code += `	}
}
\n`;

    // Tasks Implementation
    if (purpose === 'concurrent_pinger') {
      code += `// PingerTask defines the target URL and result channels.
type PingerTask struct {
	URL      string
	Response time.Duration
	Err      error
}

func main() {
`;
      if (panicRecover) {
        code += `	defer func() {
		if r := recover(); r != nil {
			`;
        if (structuredLogging) {
          code += `slog.Error("Recovered from fatal panic", "panic", r)\n`;
        } else {
          code += `log.Printf("[PANIC RECOVERED] Fatal error: %v", r)\n`;
        }
        code += `		}
	}()\n\n`;
      }

      if (structuredLogging) {
        code += `	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	slog.SetDefault(logger)
	slog.Info("Initializing Go SRE Parallel Pinger daemon")\n\n`;
      } else {
        code += `	log.SetOutput(os.Stdout)
	log.Printf("Initializing Go SRE Parallel Pinger daemon")\n\n`;
      }

      code += `	targets := []string{
		"https://talaripradeep.info/",
		"https://github.com",
		"https://google.com",
	}

	concurrencyLimit := ${concurrency}
	requestTimeout := ${timeout} * time.Second

	tasksChan := make(chan string, len(targets))
	resultsChan := make(chan PingerTask, len(targets))

	// Load targets channel
	for _, target := range targets {
		tasksChan <- target
	}
	close(tasksChan)

	var wg sync.WaitGroup
	`;
      if (structuredLogging) {
        code += `slog.Info("Spawning worker pool", "workersCount", concurrencyLimit)\n`;
      } else {
        code += `log.Printf("Spawning worker pool with %d workers", concurrencyLimit)\n`;
      }

      code += `	for i := 0; i < concurrencyLimit; i++ {
		wg.Add(1)
		go func(workerID int) {
			defer wg.Done()
			client := &http.Client{Timeout: requestTimeout}
			for u := range tasksChan {
				`;
      if (structuredLogging) {
        code += `slog.Info("Executing health check", "worker", workerID, "url", u)\n`;
      } else {
        code += `log.Printf("[Worker %d] Checking: %s", workerID, u)\n`;
      }
      code += `				t0 := time.Now()
				req, err := http.NewRequest("GET", u, nil)
				if err != nil {
					resultsChan <- PingerTask{URL: u, Err: err}
					continue
				}

				resp, err := client.Do(req)
				duration := time.Since(t0)

				if err != nil {
					resultsChan <- PingerTask{URL: u, Err: err}
				} else {
					resp.Body.Close()
					if resp.StatusCode >= 400 {
						resultsChan <- PingerTask{
							URL:      u,
							Response: duration,
							Err:      fmt.Errorf("bad status code: %d", resp.StatusCode),
						}
					} else {
						resultsChan <- PingerTask{URL: u, Response: duration}
					}
				}
			}
		}(i)
	}

	wg.Wait()
	close(resultsChan)

	failuresCount := 0
	for res := range resultsChan {
		if res.Err != nil {
			failuresCount++
			`;
      if (structuredLogging) {
        code += `slog.Error("Target is UNHEALTHY", "url", res.URL, "error", res.Err)\n`;
      } else {
        code += `log.Printf("[ERROR] Unhealthy target %s: %v", res.URL, res.Err)\n`;
      }
      code += `			dispatchAlert(fmt.Sprintf("Endpoint %s failed check: %v", res.URL, res.Err))
		} else {
			`;
      if (structuredLogging) {
        code += `slog.Info("Target is HEALTHY", "url", res.URL, "latency", res.Response)\n`;
      } else {
        code += `log.Printf("[HEALTHY] Target %s latency: %v", res.URL, res.Response)\n`;
      }
      code += `		}
	}

	if failuresCount > 0 {
		`;
      if (structuredLogging) {
        code += `slog.Warn("Pinger check iteration complete with failures", "failures", failuresCount)\n`;
      } else {
        code += `log.Printf("[WARN] Check complete. %d checks failed.", failuresCount)\n`;
      }
      code += `	} else {
		`;
      if (structuredLogging) {
        code += `slog.Info("All targets passed health criteria checks successfully")\n`;
      } else {
        code += `log.Printf("[INFO] All targets checked successfully.")\n`;
      }
      code += `	}
}
`;
    } else if (purpose === 'log_parser') {
      const logFile = $('log_filepath').value.trim() || '/var/log/app.log';
      code += `func main() {
`;
      if (panicRecover) {
        code += `	defer func() {
		if r := recover(); r != nil {
			`;
        if (structuredLogging) {
          code += `slog.Error("Recovered from panic inside Log Parser daemon", "panic", r)\n`;
        } else {
          code += `log.Printf("[PANIC RECOVERED] Daemon error: %v", r)\n`;
        }
        code += `		}
	}()\n\n`;
      }

      if (structuredLogging) {
        code += `	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	slog.SetDefault(logger)
	slog.Info("Starting SRE Log Parsing Engine daemon", "targetFile", "${logFile}")\n\n`;
      } else {
        code += `	log.SetOutput(os.Stdout)
	log.Printf("Starting SRE Log Parsing Engine daemon on: %s", "${logFile}")\n\n`;
      }

      code += `	file, err := os.Open("${logFile}")
	if err != nil {
		`;
      if (structuredLogging) {
        code += `slog.Error("Failed to open log file", "path", "${logFile}", "error", err)\n`;
      } else {
        code += `log.Printf("[ERROR] Log open failed for %s: %v", "${logFile}", err)\n`;
      }
      code += `		dispatchAlert(fmt.Sprintf("Log Parser: Failed to read access log: %v", err))
		os.Exit(1)
	}
	defer file.Close()

	// Compile high-performance regex for matching errors/outliers
	errPattern := regexp.MustCompile(\`(?i)(error|critical|fatal|panic|500|502|503|504)\`)

	scanner := bufio.NewScanner(file)
	linesScanned := 0
	issuesMatched := 0

	for scanner.Scan() {
		linesScanned++
		line := scanner.Text()

		if errPattern.MatchString(line) {
			issuesMatched++
			`;
      if (structuredLogging) {
        code += `slog.Warn("Pattern match found in log line", "lineNum", linesScanned, "line", line)\n`;
      } else {
        code += `log.Printf("[ALERT MATCHED] Line %d: %s", linesScanned, line)\n`;
      }
      code += `			if issuesMatched <= 5 {
				dispatchAlert(fmt.Sprintf("Line %d Matched: %s", linesScanned, line))
			}
		}
	}

	if err := scanner.Err(); err != nil {
		`;
      if (structuredLogging) {
        code += `slog.Error("Scanner read failure", "error", err)\n`;
      } else {
        code += `log.Printf("[ERROR] Scanner read error: %v", err)\n`;
      }
      code += `	}

	`;
      if (structuredLogging) {
        code += `slog.Info("Audit run complete", "scannedLines", linesScanned, "matchedIssues", issuesMatched)\n`;
      } else {
        code += `log.Printf("Audit run complete. Scanned %d lines. Matched %d issues.", linesScanned, issuesMatched)\n`;
      }
      code += `}
`;
    } else if (purpose === 'pod_watcher') {
      const namespace = $('k8s_namespace').value.trim() || 'production';
      code += `func main() {
`;
      if (panicRecover) {
        code += `	defer func() {
		if r := recover(); r != nil {
			`;
        if (structuredLogging) {
          code += `slog.Error("Recovered from panic inside Kubernetes Pod Watcher", "panic", r)\n`;
        } else {
          code += `log.Printf("[PANIC RECOVERED] Pod Watcher panic: %v", r)\n`;
        }
        code += `		}
	}()\n\n`;
      }

      if (structuredLogging) {
        code += `	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	slog.SetDefault(logger)
	slog.Info("Initializing client-go SDK integration", "namespace", "${namespace}")\n\n`;
      } else {
        code += `	log.SetOutput(os.Stdout)
	log.Printf("Initializing Kubernetes client-go loop for namespace: %s", "${namespace}")\n\n`;
      }

      code += `	// Load dynamic cluster config configurations
	var config *rest.Config
	var err error

	// Try in-cluster first
	config, err = rest.InClusterConfig()
	if err != nil {
		// Fallback to local kubeconfig path
		`;
      if (structuredLogging) {
        code += `slog.Info("Running outside pod container, falling back to local kubeconfig kubeconfig")\n`;
      } else {
        code += `log.Println("[INFO] Local kubeconfig resolver path selected.")\n`;
      }
      code += `		homeDir, _ := os.UserHomeDir()
		kubeconfig := filepath.Join(homeDir, ".kube", "config")
		config, err = clientcmd.BuildConfigFromFlags("", kubeconfig)
		if err != nil {
			`;
      if (structuredLogging) {
        code += `slog.Error("Failed to resolve kubeconfig context paths", "error", err)\n`;
      } else {
        code += `log.Printf("[ERROR] Kubeconfig build context configuration failed: %v", err)\n`;
      }
      code += `			os.Exit(1)
		}
	}

	clientset, err := kubernetes.NewForConfig(config)
	if err != nil {
		`;
      if (structuredLogging) {
        code += `slog.Error("Failed to init clientset", "error", err)\n`;
      } else {
        code += `log.Printf("[ERROR] Core Client creation failure: %v", err)\n`;
      }
      code += `		os.Exit(1)
	}

	ctx := context.Background()
	watcher, err := clientset.CoreV1().Pods("${namespace}").Watch(ctx, metav1.ListOptions{})
	if err != nil {
		`;
      if (structuredLogging) {
        code += `slog.Error("Failed to watch pods API endpoint", "error", err)\n`;
      } else {
        code += `log.Printf("[ERROR] Client watch target init failure: %v", err)\n`;
      }
      code += `		os.Exit(1)
	}
	defer watcher.Stop()

	`;
      if (structuredLogging) {
        code += `slog.Info("Kubernetes pod watch channel established", "status", "listening")\n`;
      } else {
        code += `log.Println("[INFO] Listening on API changes watcher logs...")\n`;
      }

      code += `	for event := range watcher.ResultChan() {
		// Skeleton logic checks terminated/waiting CrashLoopBackOff/OOMKilled pods
		// and triggers warnings to webhooks.
		`;
      if (structuredLogging) {
        code += `slog.Info("Event captured from API server", "eventType", event.Type)\n`;
      } else {
        code += `log.Printf("[EVENT] Captured API change: %v", event.Type)\n`;
      }
      code += `	}
}
`;
    } else if (purpose === 'metrics_exporter') {
      const port = parseInt($('metrics_port').value) || 8080;
      code += `func main() {
`;
      if (panicRecover) {
        code += `	defer func() {
		if r := recover(); r != nil {
			`;
        if (structuredLogging) {
          code += `slog.Error("Recovered from server panic in HTTP metric engine", "panic", r)\n`;
        } else {
          code += `log.Printf("[PANIC RECOVERED] Metric server panic: %v", r)\n`;
        }
        code += `		}
	}()\n\n`;
      }

      if (structuredLogging) {
        code += `	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	slog.SetDefault(logger)
	slog.Info("Starting Prometheus Metrics Server", "port", ${port})\n\n`;
      } else {
        code += `	log.SetOutput(os.Stdout)
	log.Printf("Starting Prometheus Metrics Server on port %d", ${port})\n\n`;
      }

      code += `	http.HandleFunc("/metrics", func(w http.ResponseWriter, r *http.Header) {
		w.Header().Set("Content-Type", "text/plain; version=0.0.4; charset=utf-8")
		
		// In Go SRE system, mock cpu and RAM metrics outputs
		cpuUsage := rand.Float64() * 100
		ramUsage := rand.Float64() * 100

		fmt.Fprintf(w, "# HELP system_cpu_usage Percent of CPU load\\n")
		fmt.Fprintf(w, "# TYPE system_cpu_usage gauge\\n")
		fmt.Fprintf(w, "system_cpu_usage{host=\\"local\\"} %0.2f\\n", cpuUsage)

		fmt.Fprintf(w, "# HELP system_ram_usage Percent of RAM allocations\\n")
		fmt.Fprintf(w, "# TYPE system_ram_usage gauge\\n")
		fmt.Fprintf(w, "system_ram_usage{host=\\"local\\"} %0.2f\\n", ramUsage)
	})

	`;
      if (structuredLogging) {
        code += `slog.Info("Metrics engine online", "address", "0.0.0.0:${port}")\n`;
      } else {
        code += `log.Printf("[INFO] Exporter serving metrics at http://localhost:${port}/metrics")\n`;
      }

      code += `	if err := http.ListenAndServe(":${port}", nil); err != nil {
		`;
      if (structuredLogging) {
        code += `slog.Error("Server start failure", "error", err)\n`;
      } else {
        code += `log.Printf("[FATAL] Server launch failure: %v", err)\n`;
      }
      code += `		os.Exit(1)
	}
}
`;
    }

    compiledCode.script = code;
  }

  function compileGoMod() {
    const purpose = $('script_purpose').value;
    let mod = `module github.com/pradeep/sre-go-utility

go 1.21

`;
    if (purpose === 'pod_watcher') {
      mod += `require (
	k8s.io/apimachinery v0.29.0
	k8s.io/client-go v0.29.0
)
`;
    }
    compiledCode.requirements = mod;
  }

  function compileMakefile() {
    compiledCode.makefile = `# Makefile for Go SRE Utility
# Generated dynamically by Go SRE Studio

.PHONY: all build test clean run

BINARY_NAME=sre-go-utility

all: test build

build:
	go build -o $(BINARY_NAME) main.go

test:
	go test -v ./...

clean:
	rm -f $(BINARY_NAME)
	go clean

run: build
	./$(BINARY_NAME)
`;
  }

  function compileDockerfile() {
    compiledCode.dockerfile = `# Multi-stage Dockerfile targeting minimal distroless footprints
# Stage 1: Compiles binary securely using a standard build container
FROM golang:1.21-alpine AS builder

WORKDIR /app

COPY go.mod ./
RUN go mod download

COPY main.go ./

# Compile static binary with optimizations
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o sre-go-utility main.go

# Stage 2: Target clean distroless/scratch container for small image footprints
FROM gcr.io/distroless/static-debian12:latest

WORKDIR /

COPY --from=builder /app/sre-go-utility /sre-go-utility

USER nonroot:nonroot

ENTRYPOINT ["/sre-go-utility"]
`;
  }

  function compileReadme() {
    const purpose = $('script_purpose').value;
    let md = `# Go SRE Automation utility v${SCRIPT_VERSION}\n\n`;
    md += `A production-ready Golang system utility designed to run inside orchestration tasks or edge monitoring endpoints.\n\n`;
    md += `## Compilation and Setup\n`;
    md += `Compile and execute the Go binary using standard compiler:\n`;
    md += `\`\`\`bash\n`;
    md += `go mod tidy\n`;
    md += `go build -o sre-utility main.go\n`;
    md += `./sre-utility\n`;
    md += `\`\`\`\n\n`;
    md += `## Container Builds\n`;
    md += `Build lightweight scratch production container images:\n`;
    md += `\`\`\`bash\n`;
    md += `docker build -t sre-go-utility:latest .\n`;
    md += `\`\`\`\n\n`;
    md += `## Makefile Automation Commands\n`;
    md += `- \`make build\`: Compiles optimization binaries\n`;
    md += `- \`make test\`: Runs test packages\n`;
    md += `- \`make run\`: Compiles and executes binary locally\n`;

    compiledCode.readme = md;
  }

  function compileRunbook() {
    const purpose = $('script_purpose').value;
    const webhook = $('alert_webhook').value.trim();
    const concurrency = $('concurrency_limit').value;
    const timeout = $('request_timeout').value;
    const structuredLogging = $('go_structured_logging').checked;
    const panicRecover = $('go_panic_recover').checked;

    let md = `# SRE Runbook: Go Operational Guidelines v${SCRIPT_VERSION}\n\n`;
    md += `Operational runbook reference containing setup guides, critical parameters, and validation logs.\n\n`;
    md += `## Configurations parameters values\n\n`;
    md += `| Parameter | Configured Value | Operational Impact | SRE Safety Tips |\n`;
    md += `|---|---|---|---|\n`;
    md += `| **SRE Task** | \`${purpose}\` | Primary workflow logic pattern. | Validate local ports mapping. |\n`;
    md += `| **Concurrency Limit** | \`${concurrency} workers\` | Sets concurrent goroutines worker pool counts. | Too high rates can cause local socket exhaustion. |\n`;
    md += `| **Timeout Limit** | \`${timeout}s\` | Network client thresholds parameters. | Always configure thresholds below server limits. |\n`;
    md += `| **Panic Recovery** | \`${panicRecover}\` | Controls catch defer loops. | Strongly recommended to prevent core execution dump drops. |\n`;
    md += `| **Structured Logs** | \`${structuredLogging}\` | Prints logs formatted in json slog blocks. | Vital for indexing pipeline parsers (Splunk/Loki). |\n\n`;

    md += `## Troubleshooting guides\n\n`;
    md += `### CPU and Memory spikes\n`;
    md += `- Monitor goroutine counts if concurrency is configured high.\n`;
    md += `- Check file permissions if parser engine reports access exceptions.\n`;
    md += `- Ensure webhook endpoint is reachable on active socket boundaries.\n`;

    compiledCode.runbook = md;
  }

  function compileMermaidFlow() {
    const purpose = $('script_purpose').value;
    let chart = 'graph TD\n';
    
    if (purpose === 'concurrent_pinger') {
      chart += `  Input[Targets URL Pool] --> WorkerPool[Spawn Goroutines Pool]\n`;
      chart += `  WorkerPool --> Channels[Dispatch tasks over Context Channels]\n`;
      chart += `  Channels --> Execution{Verify target HTTP response?}\n`;
      chart += `  Execution -->|Healthy| Log[Write JSON slog / Log success]\n`;
      chart += `  Execution -->|Error / Timeout| Alert[Trigger Webhook POST Alarm]\n`;
    } else if (purpose === 'log_parser') {
      chart += `  LogFile[Open Access Log File] --> Tail[Read line by line]\n`;
      chart += `  Tail --> Regex{Regex match error pattern?}\n`;
      chart += `  Regex -->|Yes| Alert[Dispatch Webhook Alarm]\n`;
      chart += `  Regex -->|No| Complete[Log healthy log trace]\n`;
    } else if (purpose === 'pod_watcher') {
      chart += `  Config[Load client-go configs] --> ClientSet[Init K8s Core API]\n`;
      chart += `  ClientSet --> Watcher[Open Pod API changes watch channel]\n`;
      chart += `  Watcher --> Failures{Detect restarts/OOMKilled?}\n`;
      chart += `  Failures -->|Yes| Alert[Webhook notification trigger]\n`;
    } else if (purpose === 'metrics_exporter') {
      chart += `  Server[HTTP metrics router listener] --> Metrics[Read /metrics route]\n`;
      chart += `  Metrics --> Proc[Collect CPU/RAM sample metrics]\n`;
      chart += `  Proc --> Render[Format and print in Prometheus lines]\n`;
    }

    compiledCode.flow = chart;
  }

  function updateExplanation() {
    const purpose = $('script_purpose').value;
    const explainWhy = $('explain-why');
    if (explainWhy) {
      explainWhy.innerHTML = `Compiles secure, robust concurrent Go SRE scripts. Configures goroutine pools, channel pipelines, and panic safety hooks.`;
    }
    const explainWhere = $('explain-where');
    if (explainWhere) {
      explainWhere.innerHTML = `Execute the binary on bare metal servers, compile static images via multi-stage Dockerfiles, or deploy as Kubernetes CronJobs.`;
    }
    const explainCmd = $('explain-command');
    if (explainCmd) {
      explainCmd.textContent = `make test\nmake build\n./sre-go-utility`;
    }
    const practices = $('explain-practices');
    if (practices) {
      practices.innerHTML = `
        <li>Always configure structured logs (slog) in json blocks for Prometheus/Loki indexes integration.</li>
        <li>Set worker bounds to prevent resource spikes and socket leakage.</li>
        <li>Implement panic recovery blocks to prevent whole daemon crash triggers.</li>
      `;
    }
    const explainAi = $('explain-ai-mlops');
    if (explainAi) {
      explainAi.innerHTML = `Use high-performance parallel loops to sweep unmapped ML weights directories or ping LLM serving routes in real-time.`;
    }
    const explainFlow = $('explain-flow');
    if (explainFlow) {
      explainFlow.textContent = `Goroutines Worker Pool ---> [HTTP GET / IO Check] ---> [Structured Logger slog] ---> [Webhook Alarm Router]`;
    }
  }

  function updateViewportContent() {
    if (activeTab === 'flow') {
      $('output-box').classList.add('hidden');
      $('mermaid-container').classList.remove('hidden');

      const container = $('mermaid-container');
      container.innerHTML = '<div class="mermaid text-center">' + compiledCode.flow + '</div>';

      if (typeof mermaid === 'undefined') {
        container.innerHTML = `<pre class="text-rose-400 font-mono text-xs p-4">Mermaid library is not loaded. Code:\n${compiledCode.flow}</pre>`;
      } else {
        try {
          mermaid.run({
            nodes: [container.querySelector('.mermaid')]
          });
        } catch (e) {
          console.error("Mermaid error:", e);
          container.innerHTML = `<pre class="text-rose-400 font-mono text-xs p-4">Mermaid Error: ${e.message}\nCode:\n${compiledCode.flow}</pre>`;
        }
      }
    } else {
      $('output-box').classList.remove('hidden');
      $('mermaid-container').classList.add('hidden');
      $('output-box').textContent = compiledCode[activeTab];
    }
  }

  function switchTab(tabId) {
    activeTab = tabId;
    $$('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    const targetTabBtn = $('tab-' + tabId);
    if (targetTabBtn) targetTabBtn.classList.add('active');

    const nameBox = $('download-name-input');
    const extTag = $('file-extension-tag');

    if (tabId === 'script') {
      nameBox.value = 'main';
      extTag.textContent = '.go';
    } else if (tabId === 'requirements') {
      nameBox.value = 'go';
      extTag.textContent = '.mod';
    } else if (tabId === 'makefile') {
      nameBox.value = 'Makefile';
      extTag.textContent = '';
    } else if (tabId === 'dockerfile') {
      nameBox.value = 'Dockerfile';
      extTag.textContent = '';
    } else if (tabId === 'readme') {
      nameBox.value = 'README';
      extTag.textContent = '.md';
    } else if (tabId === 'runbook') {
      nameBox.value = 'sre_runbook';
      extTag.textContent = '.md';
    } else if (tabId === 'flow') {
      nameBox.value = 'flow';
      extTag.textContent = '.mermaid';
    }
    updateViewportContent();
  }

  function triggerCompileAll() {
    compileGo();
    compileGoMod();
    compileMakefile();
    compileDockerfile();
    compileReadme();
    compileRunbook();
    compileMermaidFlow();
    updateExplanation();
    updateViewportContent();
  }

  function copyActiveTabContent() {
    const content = compiledCode[activeTab];
    navigator.clipboard.writeText(content).then(() => {
      showToast('✅ Copied tab config to clipboard!');
    });
  }

  function downloadScriptZip() {
    const purpose = $('script_purpose').value;
    if (typeof JSZip === 'undefined') {
      showToast('❌ JSZip library not loaded.');
      return;
    }
    const zip = new JSZip();

    zip.file('main.go', compiledCode.script);
    zip.file('go.mod', compiledCode.requirements);
    zip.file('Makefile', compiledCode.makefile);
    zip.file('Dockerfile', compiledCode.dockerfile);
    zip.file('README.md', compiledCode.readme);
    zip.file('sre_runbook.md', compiledCode.runbook);

    zip.generateAsync({ type: 'blob' }).then(blob => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `go-sre-${purpose}.zip`;
      a.click();
      showToast('⬇️ Go SRE package downloaded successfully!');
    });
  }

  function clearAllFields() {
    $('script_purpose').value = 'concurrent_pinger';
    $('alert_webhook').value = 'https://hooks.slack.com/services/T000/B000/XXXXXX';
    $('concurrency_limit').value = '5';
    $('request_timeout').value = '5';
    $('go_panic_recover').checked = true;
    $('go_structured_logging').checked = true;

    $('metrics_port').value = '8080';
    $('log_filepath').value = '/var/log/app.log';
    $('k8s_namespace').value = 'production';

    // trigger category visibility
    toggleOptionsVisibility();
    switchTab('script');
    triggerCompileAll();
    showToast('Restored defaults configurations!');
  }

  function toggleOptionsVisibility() {
    const purpose = $('script_purpose').value;
    
    // Hide all
    $('pinger-options').classList.add('hidden');
    $('parser-options').classList.add('hidden');
    $('watcher-options').classList.add('hidden');
    $('exporter-options').classList.add('hidden');

    if (purpose === 'concurrent_pinger') {
      $('pinger-options').classList.remove('hidden');
    } else if (purpose === 'log_parser') {
      $('parser-options').classList.remove('hidden');
    } else if (purpose === 'pod_watcher') {
      $('watcher-options').classList.remove('hidden');
    } else if (purpose === 'metrics_exporter') {
      $('exporter-options').classList.remove('hidden');
    }
    
    compileManual();
  }

  function showToast(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.className = 'fixed bottom-6 right-6 bg-slate-900 text-white font-semibold text-xs px-4 py-3 rounded-xl shadow-lg z-50 border border-slate-800 transition duration-300';
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  function toggleManualItem(idx) {
    const el = $('manual-item-' + idx);
    if (el) el.classList.toggle('hidden');
  }

  function compileManual() {
    const purpose = $('script_purpose').value;
    const container = $('sre-manual-accordion');
    if (!container) return;

    let html = '';

    const manualData = {
      'concurrent_pinger': [
        {
          title: 'Concurrency Limit',
          why: 'Restricts the max worker goroutines spawned concurrently to ping endpoints.',
          whyNot: 'High concurrency may exhaust system resources, local network sockets, or cause remote servers to rate-limit or block.',
          runtime: 'Channels act as worker pool bounds.'
        },
        {
          title: 'Request Timeout',
          why: 'Configures HTTP client context durations to abort requests that hang.',
          whyNot: 'Without timeouts, worker goroutines hang indefinitely, locking system threads.',
          runtime: 'Applies time.Duration values to net/http clients.'
        }
      ],
      'log_parser': [
        {
          title: 'Log File Path',
          why: 'Specifies the path of the system or application log file to tail and parse.',
          whyNot: 'Script will crash immediately on launch if path is unreadable.',
          runtime: 'Streams file using bufio.NewScanner.'
        }
      ],
      'pod_watcher': [
        {
          title: 'Namespace Watch Filter',
          why: 'Limits watch event streams to a single namespace context.',
          whyNot: 'Scans the entire Kubernetes cluster API load, potentially causing high RBAC failures.',
          runtime: 'Injects namespace to clientset CoreV1 Pods Watch.'
        }
      ],
      'metrics_exporter': [
        {
          title: 'Prometheus Bind Port',
          why: 'Binds the HTTP Prometheus server route on the target network port.',
          whyNot: 'Causes port conflict failures if another web daemon is running.',
          runtime: 'Launches http.ListenAndServe on port.'
        }
      ]
    };

    const options = manualData[purpose] || [];
    options.forEach((opt, idx) => {
      html += `
        <div class="border border-slate-100 rounded-lg p-3 bg-slate-50/50 mb-2">
          <div class="font-bold text-gray-800 flex justify-between items-center cursor-pointer" onclick="toggleManualItem(${idx})">
            <span>⚙️ ${opt.title}</span>
            <span class="text-[10px] text-indigo-600 font-mono">🔍 Read Info</span>
          </div>
          <div class="mt-2 space-y-1.5 text-[11px] text-gray-600 hidden" id="manual-item-${idx}">
            <p class="leading-relaxed"><strong>📘 Why Use:</strong> ${opt.why}</p>
            <p class="leading-relaxed"><strong>⚠️ If Not Used:</strong> ${opt.whyNot}</p>
            <p class="leading-relaxed"><strong>⚙️ Runtime Behavior:</strong> ${opt.runtime}</p>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  // Event bindings
  const inputSelectors = [
    'script_purpose', 'alert_webhook', 'concurrency_limit',
    'request_timeout', 'go_panic_recover', 'go_structured_logging',
    'metrics_port', 'log_filepath', 'k8s_namespace'
  ];

  inputSelectors.forEach(id => {
    const el = $(id);
    if (el) {
      el.addEventListener('input', () => {
        if (id === 'script_purpose') toggleOptionsVisibility();
        triggerCompileAll();
      });
      el.addEventListener('change', () => {
        if (id === 'script_purpose') toggleOptionsVisibility();
        triggerCompileAll();
      });
    }
  });

  // Expose global window API endpoints
  window.switchTab = switchTab;
  window.triggerCompileAll = triggerCompileAll;
  window.copyActiveTabContent = copyActiveTabContent;
  window.downloadScriptZip = downloadScriptZip;
  window.clearAllFields = clearAllFields;
  window.toggleManualItem = toggleManualItem;
  
  window.explainActiveTabCode = () => {
    const drawer = $('explanation-drawer');
    if (drawer) drawer.classList.remove('translate-x-full');
  };

  window.closeExplanationDrawer = () => {
    const drawer = $('explanation-drawer');
    if (drawer) drawer.classList.add('translate-x-full');
  };

  // Run initial compile
  toggleOptionsVisibility();
  triggerCompileAll();
}

if (document.readyState !== 'loading') {
  initGoConfig();
} else {
  document.addEventListener('DOMContentLoaded', initGoConfig);
}
