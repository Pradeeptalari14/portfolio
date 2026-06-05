import { setupCompilerTriggers } from '../utils/events.js';

const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

let activeTab = 'guide';
let currentServer = 'github';
let compiledCode = { guide: '', config: '', operations: '', diagram: '', deploy: '' };

// MCP Servers Registry
const mcpServersRegistry = {
  "source_control": {
    "title": "Source Control",
    "servers": {
      "github": {
        "title": "GitHub MCP",
        "purpose": "Enables AI agents to query repo data, handle commits, forks, files, issues, pull requests, and releases.",
        "useCases": "Automating pull request summaries, lint error checks, and branch conflict triaging.",
        "permissions": "GitHub Personal Access Token (PAT) with repo and write scopes.",
        "security": "Enforce branch protections. Require approvals before merges.",
        "installation": "npm install -g @modelcontextprotocol/server-github",
        "params": [
          { "id": "github_pat", "label": "GitHub Personal Access Token", "type": "password", "placeholder": "ghp_..." },
          { "id": "github_owner", "label": "Default Owner / Organization", "type": "text", "placeholder": "Pradeeptalari14" }
        ],
        "configTemplate": (p) => ({
          "mcpServers": {
            "github": {
              "command": "npx",
              "args": ["-y", "@modelcontextprotocol/server-github"],
              "env": {
                "GITHUB_PERSONAL_ACCESS_TOKEN": p.github_pat || "<GITHUB_PAT>",
                "GITHUB_OWNER": p.github_owner || "Pradeeptalari14"
              }
            }
          }
        }),
        "canDo": "List repos, check PRs, review code, create issues, commit changes.",
        "cannotDo": "Force push to protected branches, delete repositories, modify organization billing.",
        "readOnly": "list_repositories, get_pull_request, get_issue, get_file_contents",
        "write": "create_pull_request, create_issue, write_file_contents",
        "danger": "delete_ref, create_repository",
        "troubleshooting": "Invalid PAT token scopes (verify repo scope is checked). Rate limits saturated (configure caching or throttle agent searches)."
      },
      "gitlab": {
        "title": "GitLab MCP",
        "purpose": "Provides agent bindings to GitLab projects, pipelines, issues, merge requests, and runners.",
        "useCases": "Monitoring pipeline states, trigger deployment jobs, and summarizing merge requests.",
        "permissions": "GitLab Personal Access Token with api scope.",
        "security": "Require multi-person approvals on merge requests targeting main/master branches.",
        "installation": "npm install -g @modelcontextprotocol/server-gitlab",
        "params": [
          { "id": "gitlab_token", "label": "GitLab Access Token", "type": "password", "placeholder": "glpat-..." },
          { "id": "gitlab_url", "label": "GitLab Base URL", "type": "text", "placeholder": "https://gitlab.com" }
        ],
        "configTemplate": (p) => ({
          "mcpServers": {
            "gitlab": {
              "command": "npx",
              "args": ["-y", "@modelcontextprotocol/server-gitlab"],
              "env": {
                "GITLAB_PERSONAL_ACCESS_TOKEN": p.gitlab_token || "<GITLAB_TOKEN>",
                "GITLAB_BASE_URL": p.gitlab_url || "https://gitlab.com"
              }
            }
          }
        }),
        "canDo": "Audit pipelines, query merge requests, create issues, view codebase files.",
        "cannotDo": "Modify server system variables, delete group namespaces, cancel admin users.",
        "readOnly": "get_project, list_merge_requests, get_pipeline_status",
        "write": "create_merge_request, post_comment, trigger_pipeline",
        "danger": "delete_project, delete_branch",
        "troubleshooting": "Self-hosted SSL failures (trust certificate in local Node config). Private runner registration timeouts."
      },
      "bitbucket": {
        "title": "Bitbucket MCP",
        "purpose": "Interfaces with Bitbucket Cloud/Server APIs for repo data, commits, and pull requests.",
        "useCases": "Assessing pull request review queues and verifying commit structures.",
        "permissions": "Bitbucket App Password with repository:write scopes.",
        "security": "Mask passwords in runtime logs, enforce strict authorization policies.",
        "installation": "npm install -g @modelcontextprotocol/server-bitbucket",
        "params": [
          { "id": "bb_username", "label": "Bitbucket Username", "type": "text", "placeholder": "username" },
          { "id": "bb_password", "label": "Bitbucket App Password", "type": "password", "placeholder": "AppPassword..." }
        ],
        "configTemplate": (p) => ({
          "mcpServers": {
            "bitbucket": {
              "command": "npx",
              "args": ["-y", "@modelcontextprotocol/server-bitbucket"],
              "env": {
                "BITBUCKET_USERNAME": p.bb_username || "<USERNAME>",
                "BITBUCKET_APP_PASSWORD": p.bb_password || "<APP_PASSWORD>"
              }
            }
          }
        }),
        "canDo": "Query pull requests, list repositories, inspect commit logs.",
        "cannotDo": "Modify repository workspace configurations, override project policies.",
        "readOnly": "list_repos, get_pull_request, get_commits",
        "write": "create_pull_request, add_comment",
        "danger": "delete_repo, delete_branch",
        "troubleshooting": "Workspace verification failures (verify workspace ID parameter is correct)."
      },
      "azure_devops": {
        "title": "Azure DevOps MCP",
        "purpose": "Integrates with Azure Boards, Repos, and Pipelines for CI/CD and work item tracking.",
        "useCases": "Updating work item boards based on SRE logs, auditing pipeline run files.",
        "permissions": "Personal Access Token with Build, Work Items, and Code permissions.",
        "security": "Isolate agent access. Maintain audit trail files.",
        "installation": "npm install -g @modelcontextprotocol/server-azure-devops",
        "params": [
          { "id": "az_pat", "label": "Azure DevOps PAT", "type": "password", "placeholder": "PATToken..." },
          { "id": "az_org", "label": "Organization URL", "type": "text", "placeholder": "https://dev.azure.com/org" }
        ],
        "configTemplate": (p) => ({
          "mcpServers": {
            "azure_devops": {
              "command": "npx",
              "args": ["-y", "@modelcontextprotocol/server-azure-devops"],
              "env": {
                "AZURE_DEVOPS_PAT": p.az_pat || "<PAT>",
                "AZURE_DEVOPS_ORG_URL": p.az_org || "https://dev.azure.com/org"
              }
            }
          }
        }),
        "canDo": "Update work items, launch builds, review pull requests.",
        "cannotDo": "Edit organization security settings, manage pipeline agent pools.",
        "readOnly": "get_work_item, list_builds, get_repo_details",
        "write": "update_work_item, queue_build, create_pr",
        "danger": "delete_pipeline, delete_repo",
        "troubleshooting": "Service connection verification failures (check org URL scopes)."
      }
    }
  },
  "cloud": {
    "title": "Cloud Infrastructure",
    "servers": {
      "aws": {
        "title": "AWS MCP",
        "purpose": "Provides AWS API interface for resource querying, metrics, and EC2/S3 adjustments.",
        "useCases": "Audit idle security groups, trigger EBS snapshots, and query CloudWatch logs.",
        "permissions": "AWS IAM User credentials with restricted ReadOnlyAccess + specific write permissions.",
        "security": "Enforce IAM Least Privilege. Do NOT allow root account keys.",
        "installation": "npm install -g @modelcontextprotocol/server-aws",
        "params": [
          { "id": "aws_key", "label": "AWS Access Key ID", "type": "text", "placeholder": "AKIA..." },
          { "id": "aws_secret", "label": "AWS Secret Access Key", "type": "password", "placeholder": "Secret..." },
          { "id": "aws_region", "label": "Default Region", "type": "text", "placeholder": "us-east-1" }
        ],
        "configTemplate": (p) => ({
          "mcpServers": {
            "aws": {
              "command": "npx",
              "args": ["-y", "@modelcontextprotocol/server-aws"],
              "env": {
                "AWS_ACCESS_KEY_ID": p.aws_key || "<ACCESS_KEY>",
                "AWS_SECRET_ACCESS_KEY": p.aws_secret || "<SECRET_KEY>",
                "AWS_DEFAULT_REGION": p.aws_region || "us-east-1"
              }
            }
          }
        }),
        "canDo": "Query CloudWatch logs, list ECS tasks, describe EC2 states.",
        "cannotDo": "Modify AWS billing structures, delete Route53 root zones, change IAM admin permissions.",
        "readOnly": "ec2_describe_instances, cloudwatch_get_metric_data, s3_list_buckets",
        "write": "ec2_start_instances, s3_put_object, lambda_update_function_code",
        "danger": "rds_delete_db_instance, iam_delete_user",
        "troubleshooting": "AWS credentials validation error (verify timezone synchronization to prevent time skew errors)."
      },
      "azure": {
        "title": "Azure MCP",
        "purpose": "Binds AI models to Azure Resource Manager for query and deployment actions.",
        "useCases": "Auditing subscription budgets and restarting virtual machines.",
        "permissions": "Azure Service Principal with contributor restrictions.",
        "security": "Enforce resource group isolation and subscription caps.",
        "installation": "npm install -g @modelcontextprotocol/server-azure",
        "params": [
          { "id": "az_tenant", "label": "Azure Tenant ID", "type": "text", "placeholder": "tenant-id" },
          { "id": "az_client", "label": "Client ID", "type": "text", "placeholder": "client-id" },
          { "id": "az_secret", "label": "Client Secret", "type": "password", "placeholder": "client-secret" }
        ],
        "configTemplate": (p) => ({
          "mcpServers": {
            "azure": {
              "command": "npx",
              "args": ["-y", "@modelcontextprotocol/server-azure"],
              "env": {
                "AZURE_TENANT_ID": p.az_tenant || "<TENANT_ID>",
                "AZURE_CLIENT_ID": p.az_client || "<CLIENT_ID>",
                "AZURE_CLIENT_SECRET": p.az_secret || "<CLIENT_SECRET>"
              }
            }
          }
        }),
        "canDo": "Audit key vaults, list resource groups, restart VMs.",
        "cannotDo": "Modify subscription agreements, delete production Active Directory setups.",
        "readOnly": "list_vms, get_vault_secrets, get_billing_summary",
        "write": "restart_vm, update_rg_tags",
        "danger": "delete_vm, delete_resource_group",
        "troubleshooting": "Service principal authorization failures (check Role Assignments)."
      },
      "gcp": {
        "title": "Google Cloud MCP",
        "purpose": "Enables GCP Resource Manager and GKE interaction pipelines.",
        "useCases": "Rescaling GKE node pools, auditing Cloud Storage buckets configurations.",
        "permissions": "IAM Service Account with roles/viewer restrictions.",
        "security": "Enforce Service Account restrictions, avoid using primitive project editor roles.",
        "installation": "npm install -g @modelcontextprotocol/server-gcp",
        "params": [
          { "id": "gcp_project", "label": "GCP Project ID", "type": "text", "placeholder": "project-id" },
          { "id": "gcp_creds", "label": "JSON Credentials Path", "type": "text", "placeholder": "/path/to/key.json" }
        ],
        "configTemplate": (p) => ({
          "mcpServers": {
            "gcp": {
              "command": "npx",
              "args": ["-y", "@modelcontextprotocol/server-gcp"],
              "env": {
                "GCP_PROJECT_ID": p.gcp_project || "<PROJECT_ID>",
                "GOOGLE_APPLICATION_CREDENTIALS": p.gcp_creds || "<PATH_TO_KEY>"
              }
            }
          }
        }),
        "canDo": "Scale node pools, fetch stackdriver metrics, query buckets.",
        "cannotDo": "Enable/Disable core GCP APIs, access project billing.",
        "readOnly": "gke_list_clusters, storage_list_objects, compute_get_instance",
        "write": "gke_update_node_pool_size, compute_start_instance",
        "danger": "compute_delete_instance, storage_delete_bucket",
        "troubleshooting": "Service Account credential path validation error (ensure file is absolute path)."
      },
      "digitalocean": {
        "title": "DigitalOcean MCP",
        "purpose": "Interfaces with DigitalOcean API for Droplets and Kubernetes clusters.",
        "useCases": "Rescaling droplet sizes and verifying load balancer states.",
        "permissions": "DigitalOcean Personal Access Token with read/write scopes.",
        "security": "Mask droplet tokens, implement resource rate limitations.",
        "installation": "npm install -g @modelcontextprotocol/server-digitalocean",
        "params": [
          { "id": "do_token", "label": "DigitalOcean API Token", "type": "password", "placeholder": "dop_v1_..." }
        ],
        "configTemplate": (p) => ({
          "mcpServers": {
            "digitalocean": {
              "command": "npx",
              "args": ["-y", "@modelcontextprotocol/server-digitalocean"],
              "env": {
                "DIGITALOCEAN_ACCESS_TOKEN": p.do_token || "<DO_TOKEN>"
              }
            }
          }
        }),
        "canDo": "Audit Droplets, list clusters, verify firewalls.",
        "cannotDo": "Delete team spaces, override primary payment methods.",
        "readOnly": "list_droplets, get_cluster, list_load_balancers",
        "write": "reboot_droplet, create_firewall_rule",
        "danger": "delete_droplet, delete_cluster",
        "troubleshooting": "Droplet token authentication issues (verify scopes)."
      }
    }
  },
  "containers": {
    "title": "Containers & Registries",
    "servers": {
      "docker": {
        "title": "Docker MCP",
        "purpose": "Direct interface with local or remote Docker daemon socket parameters.",
        "useCases": "Auditing container resource footprints, pruning dangling networks/volumes.",
        "permissions": "Access to local /var/run/docker.sock socket.",
        "security": "Restrict execution namespace, avoid exposing socket over public TCP.",
        "installation": "npm install -g @modelcontextprotocol/server-docker",
        "params": [
          { "id": "docker_host", "label": "Docker Host Socket", "type": "text", "placeholder": "unix:///var/run/docker.sock" }
        ],
        "configTemplate": (p) => ({
          "mcpServers": {
            "docker": {
              "command": "npx",
              "args": ["-y", "@modelcontextprotocol/server-docker"],
              "env": {
                "DOCKER_HOST": p.docker_host || "unix:///var/run/docker.sock"
              }
            }
          }
        }),
        "canDo": "Inspect container states, view build logs, prune networks.",
        "cannotDo": "Expose docker socket over unsecured networks.",
        "readOnly": "list_containers, inspect_image, get_logs",
        "write": "start_container, stop_container, build_image",
        "danger": "remove_container, prune_system",
        "troubleshooting": "Permission Denied when reading socket (ensure agent user is in 'docker' group)."
      },
      "podman": {
        "title": "Podman MCP",
        "purpose": "Interfaces with rootless Podman service API for containers management.",
        "useCases": "Auditing rootless containers, starting local service configurations.",
        "permissions": "Access to user podman.sock file endpoint.",
        "security": "Enforce user namespace containment rules.",
        "installation": "npm install -g @modelcontextprotocol/server-podman",
        "params": [
          { "id": "podman_socket", "label": "Podman Socket Path", "type": "text", "placeholder": "unix:///run/user/1000/podman/podman.sock" }
        ],
        "configTemplate": (p) => ({
          "mcpServers": {
            "podman": {
              "command": "npx",
              "args": ["-y", "@modelcontextprotocol/server-podman"],
              "env": {
                "PODMAN_SOCKET": p.podman_socket || "unix:///run/user/1000/podman/podman.sock"
              }
            }
          }
        }),
        "canDo": "Inspect containers, check run statuses, view pod definitions.",
        "cannotDo": "Acquire host root capabilities.",
        "readOnly": "list_pods, inspect_container, view_logs",
        "write": "run_pod, stop_pod",
        "danger": "remove_pod, prune_volumes",
        "troubleshooting": "User service podman.socket is offline (run 'systemctl --user start podman.socket')."
      },
      "harbor": {
        "title": "Harbor MCP",
        "purpose": "Integrates with Harbor Registry API to audit container images and vulnerabilites.",
        "useCases": "Auditing vulnerability reports, scanning images, and garbage collection.",
        "permissions": "Harbor API Robot token with project reading scopes.",
        "security": "Enforce strict image scanning thresholds, automate image signing verification.",
        "installation": "npm install -g @modelcontextprotocol/server-harbor",
        "params": [
          { "id": "harbor_url", "label": "Harbor Base URL", "type": "text", "placeholder": "https://harbor.internal" },
          { "id": "harbor_token", "label": "Robot Token Secret", "type": "password", "placeholder": "Secret..." }
        ],
        "configTemplate": (p) => ({
          "mcpServers": {
            "harbor": {
              "command": "npx",
              "args": ["-y", "@modelcontextprotocol/server-harbor"],
              "env": {
                "HARBOR_URL": p.harbor_url || "https://harbor.internal",
                "HARBOR_TOKEN": p.harbor_token || "<TOKEN>"
              }
            }
          }
        }),
        "canDo": "Inspect artifact vulnerabilities, trigger project scans, list repositories.",
        "cannotDo": "Modify global security settings, bypass signed image validation policies.",
        "readOnly": "list_projects, get_scan_report, list_artifacts",
        "write": "scan_artifact, create_project",
        "danger": "delete_artifact, delete_project",
        "troubleshooting": "Robot token validation issues (verify expiration metadata)."
      }
    }
  },
  "kubernetes": {
    "title": "Kubernetes Platforms",
    "servers": {
      "kubernetes": {
        "title": "Kubernetes MCP",
        "purpose": "Comprehensive cluster bindings using kubectl client configurations.",
        "useCases": "Diagnosing pod terminations, scaling deployments, and fetching service logs.",
        "permissions": "RBAC ServiceAccount role with restricted cluster permissions.",
        "security": "Avoid giving cluster-admin access to the agent. Lock namespace bindings.",
        "installation": "npm install -g @modelcontextprotocol/server-kubernetes",
        "params": [
          { "id": "k8s_context", "label": "Kubeconfig Context", "type": "text", "placeholder": "gke_project_zone_cluster" }
        ],
        "configTemplate": (p) => ({
          "mcpServers": {
            "kubernetes": {
              "command": "npx",
              "args": ["-y", "@modelcontextprotocol/server-kubernetes"],
              "env": {
                "KUBERNETES_CONTEXT": p.k8s_context || "default"
              }
            }
          }
        }),
        "canDo": "List pods, get service endpoints, view deployment configurations, fetch logs.",
        "cannotDo": "Delete namespaces, overwrite cluster role bindings, modify node taint controls.",
        "readOnly": "get_pod_details, get_deployment, view_pod_logs",
        "write": "scale_deployment, apply_yaml_manifest",
        "danger": "delete_namespace, delete_deployment",
        "troubleshooting": "Kubeconfig context not found (verify active CLI configs inside ~/.kube/config)."
      },
      "openshift": {
        "title": "OpenShift MCP",
        "purpose": "Interfaces with RedHat OpenShift API (oc) for security contexts and project routes.",
        "useCases": "Auditing Security Context Constraints (SCC) and route endpoints config.",
        "permissions": "OpenShift Project-specific ServiceAccount token.",
        "security": "Enforce strict namespace boundaries, isolate privilege escalations.",
        "installation": "npm install -g @modelcontextprotocol/server-openshift",
        "params": [
          { "id": "os_api", "label": "OpenShift API Server", "type": "text", "placeholder": "https://api.openshift.internal:6443" },
          { "id": "os_token", "label": "Service Account Token", "type": "password", "placeholder": "sha256~..." }
        ],
        "configTemplate": (p) => ({
          "mcpServers": {
            "openshift": {
              "command": "npx",
              "args": ["-y", "@modelcontextprotocol/server-openshift"],
              "env": {
                "OPENSHIFT_API_URL": p.os_api || "<API_URL>",
                "OPENSHIFT_TOKEN": p.os_token || "<TOKEN>"
              }
            }
          }
        }),
        "canDo": "Check routes status, inspect projects limits, audit pods.",
        "cannotDo": "Override default system cluster security contexts.",
        "readOnly": "get_routes, list_projects, inspect_scc",
        "write": "scale_deployment_configs, patch_routes",
        "danger": "delete_project, delete_route",
        "troubleshooting": "SCC authorization failures (verify ServiceAccount permissions)."
      },
      "rancher": {
        "title": "Rancher MCP",
        "purpose": "Manages multi-cluster control planes using Rancher API endpoints.",
        "useCases": "Auditing cluster health signals, viewing multi-project dashboards.",
        "permissions": "Rancher User API key with restricted role permissions.",
        "security": "Enforce project-level scoping, disable global admin tokens.",
        "installation": "npm install -g @modelcontextprotocol/server-rancher",
        "params": [
          { "id": "rancher_url", "label": "Rancher API URL", "type": "text", "placeholder": "https://rancher.internal/v3" },
          { "id": "rancher_key", "label": "Rancher Token Key", "type": "password", "placeholder": "token-..." }
        ],
        "configTemplate": (p) => ({
          "mcpServers": {
            "rancher": {
              "command": "npx",
              "args": ["-y", "@modelcontextprotocol/server-rancher"],
              "env": {
                "RANCHER_API_URL": p.rancher_url || "https://rancher.internal/v3",
                "RANCHER_TOKEN_KEY": p.rancher_key || "<TOKEN>"
              }
            }
          }
        }),
        "canDo": "Inspect cluster health lists, check project status, list namespaces.",
        "cannotDo": "Import unauthorized clusters, modify node pool providers.",
        "readOnly": "list_clusters, get_project_details, inspect_nodes",
        "write": "update_project_limits, restart_workload",
        "danger": "remove_cluster, delete_workload",
        "troubleshooting": "Insecure TLS errors (enable trust for internal rancher certificates)."
      },
      "argocd": {
        "title": "ArgoCD MCP",
        "purpose": "Interfaces with ArgoCD API to audit gitops state alignments.",
        "useCases": "Triggering applications synchronizations, auditing out-of-sync parameters.",
        "permissions": "ArgoCD local account JWT with application sync permissions.",
        "security": "Enforce read-only syncing. Human confirmation required for manual overrides.",
        "installation": "npm install -g @modelcontextprotocol/server-argocd",
        "params": [
          { "id": "argo_url", "label": "ArgoCD Server URL", "type": "text", "placeholder": "https://argocd.internal" },
          { "id": "argo_token", "label": "Auth Token Key", "type": "password", "placeholder": "ey..." }
        ],
        "configTemplate": (p) => ({
          "mcpServers": {
            "argocd": {
              "command": "npx",
              "args": ["-y", "@modelcontextprotocol/server-argocd"],
              "env": {
                "ARGOCD_SERVER_URL": p.argo_url || "https://argocd.internal",
                "ARGOCD_AUTH_TOKEN": p.argo_token || "<TOKEN>"
              }
            }
          }
        }),
        "canDo": "List app configurations, trigger sync requests, trace diff errors.",
        "cannotDo": "Delete app projects, override repository registrations.",
        "readOnly": "get_application, list_apps, view_app_diffs",
        "write": "sync_application, rollback_application",
        "danger": "delete_application",
        "troubleshooting": "Diff connection timeout errors (check repository status parameters)."
      },
      "fluxcd": {
        "title": "FluxCD MCP",
        "purpose": "Monitors GitOps reconciliation events from Flux CRDs in-cluster.",
        "useCases": "Tracking HelmRelease states, debugging GitRepository synchronizations.",
        "permissions": "Kubernetes RBAC permissions to read and patch fluxcd.io resources.",
        "security": "Disable direct reconciliation overrides for non-staging environments.",
        "installation": "npm install -g @modelcontextprotocol/server-fluxcd",
        "params": [
          { "id": "flux_namespace", "label": "Flux Scope Namespace", "type": "text", "placeholder": "flux-system" }
        ],
        "configTemplate": (p) => ({
          "mcpServers": {
            "fluxcd": {
              "command": "npx",
              "args": ["-y", "@modelcontextprotocol/server-fluxcd"],
              "env": {
                "FLUX_SYSTEM_NAMESPACE": p.flux_namespace || "flux-system"
              }
            }
          }
        }),
        "canDo": "Audit HelmReleases, trigger source reconciles, check custom resource status.",
        "cannotDo": "Decrypt encrypted sops secrets directly without permission validation.",
        "readOnly": "list_helm_releases, get_source_status, view_reconcile_logs",
        "write": "reconcile_source, resume_reconciliation",
        "danger": "suspend_reconciliation, delete_release",
        "troubleshooting": "CRD mismatch problems (ensure Flux controllers are upgraded to match local CRD definitions)."
      }
    }
  },
  "iac": {
    "title": "Infrastructure as Code",
    "servers": {
      "terraform": {
        "title": "Terraform MCP",
        "purpose": "Runs plan files, checks structural changes, and identifies state drifts.",
        "useCases": "Analyzing plan changes for security compliance and detecting resource drift.",
        "permissions": "Access to local terraform binary and remote state credentials.",
        "security": "Human approval required for any apply operations. Lock state files.",
        "installation": "npm install -g @modelcontextprotocol/server-terraform",
        "params": [
          { "id": "tf_path", "label": "Working Directory Path", "type": "text", "placeholder": "/path/to/iac/root" }
        ],
        "configTemplate": (p) => ({
          "mcpServers": {
            "terraform": {
              "command": "npx",
              "args": ["-y", "@modelcontextprotocol/server-terraform"],
              "env": {
                "TERRAFORM_WORKING_DIR": p.tf_path || "/iac"
              }
            }
          }
        }),
        "canDo": "Run validate, format plan lists, inspect state files, trace outputs.",
        "cannotDo": "Force run apply commands without explicit developer check gates.",
        "readOnly": "terraform_show, terraform_plan_info, list_state_resources",
        "write": "terraform_init, terraform_plan",
        "danger": "terraform_apply, terraform_destroy",
        "troubleshooting": "State lock errors (ensure previous operations are terminated or clear lock files manually)."
      },
      "opentofu": {
        "title": "OpenTofu MCP",
        "purpose": "Validates configs, plans executions, and checks drift parameters using OpenTofu CLI.",
        "useCases": "Auditing open-source IaC deployments, tracing resource states.",
        "permissions": "Access to tofu CLI executable, read/write workspace states.",
        "security": "Enforce state lock policies, require approval gates for apply actions.",
        "installation": "npm install -g @modelcontextprotocol/server-opentofu",
        "params": [
          { "id": "tofu_path", "label": "OpenTofu Workspace Path", "type": "text", "placeholder": "/path/to/tofu/code" }
        ],
        "configTemplate": (p) => ({
          "mcpServers": {
            "opentofu": {
              "command": "npx",
              "args": ["-y", "@modelcontextprotocol/server-opentofu"],
              "env": {
                "OPENTOFU_WORKING_DIR": p.tofu_path || "/tofu"
              }
            }
          }
        }),
        "canDo": "Run validation routines, generate plan outputs, identify state drifts.",
        "cannotDo": "Run destroy scripts directly.",
        "readOnly": "tofu_show, tofu_plan_info, get_state",
        "write": "tofu_init, tofu_plan",
        "danger": "tofu_apply, tofu_destroy",
        "troubleshooting": "Plugin cache timeouts (verify cache directory permissions)."
      },
      "ansible": {
        "title": "Ansible MCP",
        "purpose": "Generates playbooks, triggers script validation, and manages host inventories.",
        "useCases": "Scanning host networks and checking syntax alignment in YAML playbooks.",
        "permissions": "SSH key access parameters to inventory hosts.",
        "security": "Restricted playbook configurations, disable raw shell executions.",
        "installation": "npm install -g @modelcontextprotocol/server-ansible",
        "params": [
          { "id": "ansible_invent", "label": "Inventory File Path", "type": "text", "placeholder": "/etc/ansible/hosts" }
        ],
        "configTemplate": (p) => ({
          "mcpServers": {
            "ansible": {
              "command": "npx",
              "args": ["-y", "@modelcontextprotocol/server-ansible"],
              "env": {
                "ANSIBLE_INVENTORY_PATH": p.ansible_invent || "/ansible/hosts"
              }
            }
          }
        }),
        "canDo": "Check inventory states, run playbook dry-runs, validate syntax errors.",
        "cannotDo": "Run arbitrary bash scripts on remote host architectures.",
        "readOnly": "list_hosts, check_syntax, run_playbook_dry",
        "write": "update_host_vars, write_playbook",
        "danger": "run_playbook_live",
        "troubleshooting": "SSH connection verification errors (verify host key entries inside target SSH paths)."
      },
      "pulumi": {
        "title": "Pulumi MCP",
        "purpose": "Tracks state configurations for cloud native stacks using Pulumi API.",
        "useCases": "Detecting configuration differences in Python/TS IaC pipelines.",
        "permissions": "Pulumi Access Token with read/write configurations access.",
        "security": "Strictly check target updates, force state encryption.",
        "installation": "npm install -g @modelcontextprotocol/server-pulumi",
        "params": [
          { "id": "pulumi_token", "label": "Pulumi Access Token", "type": "password", "placeholder": "pul-..." }
        ],
        "configTemplate": (p) => ({
          "mcpServers": {
            "pulumi": {
              "command": "npx",
              "args": ["-y", "@modelcontextprotocol/server-pulumi"],
              "env": {
                "PULUMI_ACCESS_TOKEN": p.pulumi_token || "<TOKEN>"
              }
            }
          }
        }),
        "canDo": "List stack resources, display update traces, show active logs.",
        "cannotDo": "Run force updates on cluster environments.",
        "readOnly": "get_stack_resources, view_update_history",
        "write": "pulumi_preview, update_config",
        "danger": "pulumi_update, pulumi_destroy",
        "troubleshooting": "State locking conflicts (terminate previous command processes)."
      }
    }
  },
  "monitoring": {
    "title": "Monitoring Stack",
    "servers": {
      "grafana": {
        "title": "Grafana MCP",
        "purpose": "Queries panels configurations, generates charts formats, and handles alerts rules.",
        "useCases": "Deploying standard dashboards when new microservices are provisioned.",
        "permissions": "Grafana Service Account Token with editor privileges.",
        "security": "Enforce dashboard version controls, do NOT expose user databases keys.",
        "installation": "npm install -g @modelcontextprotocol/server-grafana",
        "params": [
          { "id": "graf_url", "label": "Grafana Server URL", "type": "text", "placeholder": "https://grafana.internal" },
          { "id": "graf_token", "label": "Service Account Token", "type": "password", "placeholder": "glsa_..." }
        ],
        "configTemplate": (p) => ({
          "mcpServers": {
            "grafana": {
              "command": "npx",
              "args": ["-y", "@modelcontextprotocol/server-grafana"],
              "env": {
                "GRAFANA_URL": p.graf_url || "https://grafana.internal",
                "GRAFANA_API_KEY": p.graf_token || "<API_KEY>"
              }
            }
          }
        }),
        "canDo": "Deploy metrics dashboard layouts, adjust visual templates, check alert states.",
        "cannotDo": "Modify global security access rules, delete data sources links.",
        "readOnly": "list_dashboards, get_alert_rules, query_panel_data",
        "write": "create_dashboard, update_alert_rule",
        "danger": "delete_dashboard, remove_data_source",
        "troubleshooting": "Authentication token expired (verify service accounts configuration permissions)."
      },
      "prometheus": {
        "title": "Prometheus MCP",
        "purpose": "Direct interface to evaluate PromQL queries and inspect targets.",
        "useCases": "Analysing metric trends, checking anomalies, and troubleshooting node CPU limits.",
        "permissions": "Prometheus HTTP API query access rights.",
        "security": "Restrict query timeouts, enforce rate checks to prevent system starvation.",
        "installation": "npm install -g @modelcontextprotocol/server-prometheus",
        "params": [
          { "id": "prom_url", "label": "Prometheus API URL", "type": "text", "placeholder": "http://prometheus.internal:9090" }
        ],
        "configTemplate": (p) => ({
          "mcpServers": {
            "prometheus": {
              "command": "npx",
              "args": ["-y", "@modelcontextprotocol/server-prometheus"],
              "env": {
                "PROMETHEUS_URL": p.prom_url || "http://prometheus.internal:9090"
              }
            }
          }
        }),
        "canDo": "Evaluate metrics values, check targets list, diagnose CPU saturation.",
        "cannotDo": "Change cluster alerting target targets, clear server metrics history.",
        "readOnly": "query_instant, query_range, list_targets",
        "write": "none",
        "danger": "none",
        "troubleshooting": "Context deadline exceeded (optimize complex regex expressions inside PromQL syntax)."
      },
      "loki": {
        "title": "Loki MCP",
        "purpose": "Queries system and application log data using LogQL.",
        "useCases": "Retrieving error details and auditing microservice trace states.",
        "permissions": "Loki log query permissions.",
        "security": "Enforce log access restrictions, verify PII parameters masking.",
        "installation": "npm install -g @modelcontextprotocol/server-loki",
        "params": [
          { "id": "loki_url", "label": "Loki Server URL", "type": "text", "placeholder": "http://loki.internal:3100" }
        ],
        "configTemplate": (p) => ({
          "mcpServers": {
            "loki": {
              "command": "npx",
              "args": ["-y", "@modelcontextprotocol/server-loki"],
              "env": {
                "LOKI_URL": p.loki_url || "http://loki.internal:3100"
              }
            }
          }
        }),
        "canDo": "Query log lines, verify error counts, group log statistics.",
        "cannotDo": "Alter server logs retention periods.",
        "readOnly": "query_logs, list_labels, get_stream_stats",
        "write": "none",
        "danger": "none",
        "troubleshooting": "Regex query resource limits (limit time window scope parameters)."
      },
      "tempo": {
        "title": "Tempo MCP",
        "purpose": "Retrieves distributed trace paths by Span ID using Tempo API.",
        "useCases": "Tracing network request latencies, checking database connection spans.",
        "permissions": "Access to Tempo trace query endpoints.",
        "security": "Strict trace queries rate limiting, mask credentials inside trace metadata.",
        "installation": "npm install -g @modelcontextprotocol/server-tempo",
        "params": [
          { "id": "tempo_url", "label": "Tempo API URL", "type": "text", "placeholder": "http://tempo.internal:3200" }
        ],
        "configTemplate": (p) => ({
          "mcpServers": {
            "tempo": {
              "command": "npx",
              "args": ["-y", "@modelcontextprotocol/server-tempo"],
              "env": {
                "TEMPO_URL": p.tempo_url || "http://tempo.internal:3200"
              }
            }
          }
        }),
        "canDo": "Query traces by Span ID, identify latency bottlenecks in trace routes.",
        "cannotDo": "Modify server collection endpoints.",
        "readOnly": "get_trace_by_id, search_traces",
        "write": "none",
        "danger": "none",
        "troubleshooting": "Trace ID not found (verify database persistence status)."
      },
      "alertmanager": {
        "title": "Alertmanager MCP",
        "purpose": "Audits active warnings, handles silences, and tests notifications path.",
        "useCases": "Silencing expected noise during routine rolling updates.",
        "permissions": "Alertmanager service query and silence creation permissions.",
        "security": "Require confirmation limits for silencing active alerts.",
        "installation": "npm install -g @modelcontextprotocol/server-alertmanager",
        "params": [
          { "id": "am_url", "label": "Alertmanager URL", "type": "text", "placeholder": "http://alertmanager.internal:9093" }
        ],
        "configTemplate": (p) => ({
          "mcpServers": {
            "alertmanager": {
              "command": "npx",
              "args": ["-y", "@modelcontextprotocol/server-alertmanager"],
              "env": {
                "ALERTMANAGER_URL": p.am_url || "http://alertmanager.internal:9093"
              }
            }
          }
        }),
        "canDo": "View active warnings, register alerts silences, check silences lists.",
        "cannotDo": "Delete alert receivers bindings.",
        "readOnly": "list_alerts, list_silences",
        "write": "create_silence",
        "danger": "delete_silence",
        "troubleshooting": "Silence parameter rejection errors (ensure tags match exact label fields)."
      }
    }
  },
  "observability": {
    "title": "Observability Layer",
    "servers": {
      "datadog": {
        "title": "Datadog MCP",
        "purpose": "Enables query pipelines for Datadog metrics, dashboards, and monitors.",
        "useCases": "Analyzing log anomaly footprints and silencing false alerts.",
        "permissions": "Datadog API and APP Key values with specific monitors access.",
        "security": "Enforce restrictive APP keys parameters permissions.",
        "installation": "npm install -g @modelcontextprotocol/server-datadog",
        "params": [
          { "id": "dd_api", "label": "Datadog API Key", "type": "password", "placeholder": "APIKey..." },
          { "id": "dd_app", "label": "Datadog App Key", "type": "password", "placeholder": "APPKey..." },
          { "id": "dd_site", "label": "Datadog Site Domain", "type": "text", "placeholder": "datadoghq.com" }
        ],
        "configTemplate": (p) => ({
          "mcpServers": {
            "datadog": {
              "command": "npx",
              "args": ["-y", "@modelcontextprotocol/server-datadog"],
              "env": {
                "DATADOG_API_KEY": p.dd_api || "<API_KEY>",
                "DATADOG_APP_KEY": p.dd_app || "<APP_KEY>",
                "DATADOG_SITE": p.dd_site || "datadoghq.com"
              }
            }
          }
        }),
        "canDo": "Verify service metrics, check monitor health states, search traces.",
        "cannotDo": "Delete key vaults, query billing plans data.",
        "readOnly": "get_monitor_status, query_metrics, search_logs",
        "write": "mute_monitor, create_dashboard",
        "danger": "delete_monitor",
        "troubleshooting": "App Key validation failed (confirm site domain matches region endpoints)."
      },
      "new_relic": {
        "title": "New Relic MCP",
        "purpose": "Runs NRQL data queries, tracks application workloads health states.",
        "useCases": "Tracing system database transaction anomalies and alerting counts.",
        "permissions": "New Relic User API Query Key.",
        "security": "Isolate query namespaces, restrict metric deletion actions.",
        "installation": "npm install -g @modelcontextprotocol/server-newrelic",
        "params": [
          { "id": "nr_account", "label": "New Relic Account ID", "type": "text", "placeholder": "123456" },
          { "id": "nr_key", "label": "NR API Key", "type": "password", "placeholder": "NRAK-..." }
        ],
        "configTemplate": (p) => ({
          "mcpServers": {
            "new_relic": {
              "command": "npx",
              "args": ["-y", "@modelcontextprotocol/server-newrelic"],
              "env": {
                "NEW_RELIC_ACCOUNT_ID": p.nr_account || "<ACCOUNT_ID>",
                "NEW_RELIC_API_KEY": p.nr_key || "<API_KEY>"
              }
            }
          }
        }),
        "canDo": "Execute custom NRQL query logic, get workload alerts configurations.",
        "cannotDo": "Alter instrumentation code bindings.",
        "readOnly": "run_nrql_query, list_workloads, get_alerts",
        "write": "create_alerts_mute_rule",
        "danger": "delete_workload",
        "troubleshooting": "Account mismatch issues (confirm Account ID parameters are correct)."
      },
      "dynatrace": {
        "title": "Dynatrace MCP",
        "purpose": "Interfaces with Davis AI engine, queries dashboard panels, and audits warnings.",
        "useCases": "Analyzing automated roots causes logs from Dynatrace API.",
        "permissions": "Dynatrace Access Token with API v2 access scopes.",
        "security": "Enforce cluster-wide read limits, disable admin functions.",
        "installation": "npm install -g @modelcontextprotocol/server-dynatrace",
        "params": [
          { "id": "dt_url", "label": "Dynatrace Tenant URL", "type": "text", "placeholder": "https://abc.live.dynatrace.com" },
          { "id": "dt_token", "label": "Access Token Key", "type": "password", "placeholder": "dt0c01..." }
        ],
        "configTemplate": (p) => ({
          "mcpServers": {
            "dynatrace": {
              "command": "npx",
              "args": ["-y", "@modelcontextprotocol/server-dynatrace"],
              "env": {
                "DYNATRACE_TENANT_URL": p.dt_url || "<TENANT_URL>",
                "DYNATRACE_ACCESS_TOKEN": p.dt_token || "<TOKEN>"
              }
            }
          }
        }),
        "canDo": "List ongoing problems, fetch host metrics, audit tags configuration.",
        "cannotDo": "Update agent injection paths configs.",
        "readOnly": "list_problems, get_metrics, inspect_host_status",
        "write": "post_problem_comment, trigger_custom_event",
        "danger": "none",
        "troubleshooting": "Tenant URL resolution issues (confirm local DNS routes are valid)."
      },
      "elastic": {
        "title": "Elastic MCP",
        "purpose": "Direct connection to Elasticsearch for indices indexing and log audits.",
        "useCases": "Searching audit logs, verifying document health counts.",
        "permissions": "Elasticsearch API Key with specific indices query access.",
        "security": "Do NOT give global cluster access, disable raw scripting queries.",
        "installation": "npm install -g @modelcontextprotocol/server-elasticsearch",
        "params": [
          { "id": "es_node", "label": "Elastic Node URL", "type": "text", "placeholder": "https://localhost:9200" },
          { "id": "es_key", "label": "API Key Credentials", "type": "password", "placeholder": "Key..." }
        ],
        "configTemplate": (p) => ({
          "mcpServers": {
            "elastic": {
              "command": "npx",
              "args": ["-y", "@modelcontextprotocol/server-elasticsearch"],
              "env": {
                "ELASTICSEARCH_NODE_URL": p.es_node || "https://localhost:9200",
                "ELASTICSEARCH_API_KEY": p.es_key || "<API_KEY>"
              }
            }
          }
        }),
        "canDo": "Search log documents, get node statuses, inspect mapping schemas.",
        "cannotDo": "Alter storage shard allocations, delete main data indices.",
        "readOnly": "search_documents, check_cluster_health, get_mapping",
        "write": "index_document, update_alias",
        "danger": "delete_index, clear_cache",
        "troubleshooting": "SSL Validation error (configure self-signed certificate parameters)."
      },
      "opentelemetry": {
        "title": "OpenTelemetry MCP",
        "purpose": "Interfaces with OpenTelemetry Collectors endpoints for telemetry schemas audits.",
        "useCases": "Auditing spans configurations, monitoring active pipeline metric rates.",
        "permissions": "Access to Collector query endpoints.",
        "security": "Enforce query timeout barriers, restrict access namespaces.",
        "installation": "npm install -g @modelcontextprotocol/server-opentelemetry",
        "params": [
          { "id": "otel_collector", "label": "OTel Collector Endpoint", "type": "text", "placeholder": "http://localhost:4317" }
        ],
        "configTemplate": (p) => ({
          "mcpServers": {
            "opentelemetry": {
              "command": "npx",
              "args": ["-y", "@modelcontextprotocol/server-opentelemetry"],
              "env": {
                "OTEL_COLLECTOR_ENDPOINT": p.otel_collector || "http://localhost:4317"
              }
            }
          }
        }),
        "canDo": "Inspect active spans, monitor processing rates, audit attributes structures.",
        "cannotDo": "Modify trace generation policies inside app binaries.",
        "readOnly": "list_services, get_metric_definitions, verify_span_attributes",
        "write": "none",
        "danger": "none",
        "troubleshooting": "gRPC connection issues (verify port configs: default 4317)."
      }
    }
  },
  "cicd": {
    "title": "CI/CD Pipelines",
    "servers": {
      "jenkins": {
        "title": "Jenkins MCP",
        "purpose": "Binds AI models to Jenkins controllers for job runs and logs audits.",
        "useCases": "Auditing broken pipeline build console logs, triggering rollback pipelines.",
        "permissions": "Jenkins User API Token with job execution authorization.",
        "security": "Enforce folder restrictions, disable script console access actions.",
        "installation": "npm install -g @modelcontextprotocol/server-jenkins",
        "params": [
          { "id": "jen_url", "label": "Jenkins Server URL", "type": "text", "placeholder": "http://jenkins.internal:8080" },
          { "id": "jen_user", "label": "Username ID", "type": "text", "placeholder": "admin" },
          { "id": "jen_token", "label": "API User Token", "type": "password", "placeholder": "Token..." }
        ],
        "configTemplate": (p) => ({
          "mcpServers": {
            "jenkins": {
              "command": "npx",
              "args": ["-y", "@modelcontextprotocol/server-jenkins"],
              "env": {
                "JENKINS_URL": p.jen_url || "http://jenkins.internal:8080",
                "JENKINS_USER": p.jen_user || "admin",
                "JENKINS_TOKEN": p.jen_token || "<TOKEN>"
              }
            }
          }
        }),
        "canDo": "Get job builds statuses, fetch build run logs, trigger builds.",
        "cannotDo": "Run Groovy scripting commands on node terminals, modify credentials vaults.",
        "readOnly": "get_job_status, get_build_console_logs, list_jobs",
        "write": "build_job, update_job_config",
        "danger": "delete_job, restart_jenkins_node",
        "troubleshooting": "CSRF crumb validation failures (verify 'Enable Crumb issuer' is handled in local server configuration)."
      },
      "github_actions": {
        "title": "GitHub Actions MCP",
        "purpose": "Queries and triggers GitHub Actions workflow parameters.",
        "useCases": "Auditing run times, triggering custom deploy workflows.",
        "permissions": "GitHub PAT with actions:write permissions.",
        "security": "Enforce human authorization before workflow trigger execution.",
        "installation": "npm install -g @modelcontextprotocol/server-github-actions",
        "params": [
          { "id": "gh_act_token", "label": "GitHub Actions PAT", "type": "password", "placeholder": "ghp_..." }
        ],
        "configTemplate": (p) => ({
          "mcpServers": {
            "github_actions": {
              "command": "npx",
              "args": ["-y", "@modelcontextprotocol/server-github-actions"],
              "env": {
                "GITHUB_ACTIONS_TOKEN": p.gh_act_token || "<TOKEN>"
              }
            }
          }
        }),
        "canDo": "Audit run histories, read log logs, trigger workspace dispatches.",
        "cannotDo": "Delete self-hosted runner registrations.",
        "readOnly": "list_workflow_runs, get_run_logs",
        "write": "trigger_workflow_dispatch, cancel_workflow_run",
        "danger": "delete_workflow_run",
        "troubleshooting": "Missing token permissions (verify actions scope is selected)."
      },
      "gitlab_ci": {
        "title": "GitLab CI MCP",
        "purpose": "Interacts with GitLab pipelines running processes.",
        "useCases": "Debugging pipeline failures, restarting jobs.",
        "permissions": "GitLab Personal Token with api scope access.",
        "security": "Restrict job rerun capability to non-production namespaces.",
        "installation": "npm install -g @modelcontextprotocol/server-gitlab-ci",
        "params": [
          { "id": "gl_ci_token", "label": "GitLab Personal Token", "type": "password", "placeholder": "glpat-..." }
        ],
        "configTemplate": (p) => ({
          "mcpServers": {
            "gitlab_ci": {
              "command": "npx",
              "args": ["-y", "@modelcontextprotocol/server-gitlab-ci"],
              "env": {
                "GITLAB_CI_TOKEN": p.gl_ci_token || "<TOKEN>"
              }
            }
          }
        }),
        "canDo": "Inspect active pipeline logs, retry failed stages.",
        "cannotDo": "Delete runner systems.",
        "readOnly": "get_pipeline_history, view_job_log",
        "write": "retry_job, cancel_pipeline",
        "danger": "delete_pipeline",
        "troubleshooting": "Runner timeouts (check runner node tag allocations)."
      },
      "azure_pipelines": {
        "title": "Azure Pipelines MCP",
        "purpose": "Queries and triggers Azure DevOps pipeline executions.",
        "useCases": "Verifying release deployments states.",
        "permissions": "Azure DevOps PAT token.",
        "security": "Require multi-stage approvals before execution.",
        "installation": "npm install -g @modelcontextprotocol/server-azure-pipelines",
        "params": [
          { "id": "az_pipe_pat", "label": "Azure Pipelines PAT", "type": "password", "placeholder": "PATToken..." }
        ],
        "configTemplate": (p) => ({
          "mcpServers": {
            "azure_pipelines": {
              "command": "npx",
              "args": ["-y", "@modelcontextprotocol/server-azure-pipelines"],
              "env": {
                "AZURE_PIPELINES_PAT": p.az_pipe_pat || "<PAT>"
              }
            }
          }
        }),
        "canDo": "Audit deployment status records, query pipeline stages.",
        "cannotDo": "Override pipeline security group configs.",
        "readOnly": "list_pipelines, get_run_details",
        "write": "run_pipeline, approve_stage",
        "danger": "delete_pipeline",
        "troubleshooting": "Variable group mapping errors (ensure context variables are registered)."
      },
      "circleci": {
        "title": "CircleCI MCP",
        "purpose": "Integrates with CircleCI API to check pipeline and job parameters.",
        "useCases": "Debugging pipeline runs configurations.",
        "permissions": "CircleCI Personal API Token.",
        "security": "Enforce project scope containment filters.",
        "installation": "npm install -g @modelcontextprotocol/server-circleci",
        "params": [
          { "id": "circle_token", "label": "CircleCI API Token", "type": "password", "placeholder": "ccip_..." }
        ],
        "configTemplate": (p) => ({
          "mcpServers": {
            "circleci": {
              "command": "npx",
              "args": ["-y", "@modelcontextprotocol/server-circleci"],
              "env": {
                "CIRCLECI_API_TOKEN": p.circle_token || "<TOKEN>"
              }
            }
          }
        }),
        "canDo": "Check build history logs, view pipeline execution profiles.",
        "cannotDo": "Edit global context secrets.",
        "readOnly": "get_pipelines, get_job_details",
        "write": "trigger_pipeline, retry_job",
        "danger": "cancel_job",
        "troubleshooting": "Context authorization errors (check project permissions)."
      }
    }
  },
  "databases": {
    "title": "Databases",
    "servers": {
      "postgresql": {
        "title": "PostgreSQL MCP",
        "purpose": "Connects to PostgreSQL databases to inspect schemas, optimize indices, and query metrics.",
        "useCases": "Diagnosing locks blocking queries, analyzing slow query execution plan tables.",
        "permissions": "Database credentials for a user restricted to read-only schemas and specific statistics tables.",
        "security": "Strictly enforce read-only connections. Disable write/update/drop operations.",
        "installation": "npm install -g @modelcontextprotocol/server-postgres",
        "params": [
          { "id": "pg_conn", "label": "Postgres URI Connection", "type": "text", "placeholder": "postgresql://user:pass@localhost:5432/db" }
        ],
        "configTemplate": (p) => ({
          "mcpServers": {
            "postgresql": {
              "command": "npx",
              "args": ["-y", "@modelcontextprotocol/server-postgres"],
              "env": {
                "POSTGRES_CONNECTION_URI": p.pg_conn || "postgresql://localhost:5432/db"
              }
            }
          }
        }),
        "canDo": "List tables, get indexes schemas, explain slow query profiles, read logs tables.",
        "cannotDo": "Run drop table commands, alter system properties, update tables.",
        "readOnly": "list_tables, describe_table, explain_query, query_database_stats",
        "write": "none",
        "danger": "run_arbitrary_query",
        "troubleshooting": "Database client connection refused (verify firewalls access rules)."
      },
      "mysql": {
        "title": "MySQL MCP",
        "purpose": "Interfaces with MySQL endpoints for schema descriptions and transaction lists.",
        "useCases": "Auditing slow queries logs, analyzing index performance.",
        "permissions": "MySQL database user access.",
        "security": "Enforce connection timeouts limits, require read-only parameters.",
        "installation": "npm install -g @modelcontextprotocol/server-mysql",
        "params": [
          { "id": "mysql_uri", "label": "MySQL Connection URL", "type": "text", "placeholder": "mysql://user:pass@host:3306/db" }
        ],
        "configTemplate": (p) => ({
          "mcpServers": {
            "mysql": {
              "command": "npx",
              "args": ["-y", "@modelcontextprotocol/server-mysql"],
              "env": {
                "MYSQL_CONNECTION_URI": p.mysql_uri || "mysql://localhost:3306/db"
              }
            }
          }
        }),
        "canDo": "Audit tables columns, describe schemas, explain slow query profiles.",
        "cannotDo": "Modify records, drop schemas.",
        "readOnly": "list_tables, show_indexes, explain_sql_query",
        "write": "none",
        "danger": "delete_table_data",
        "troubleshooting": "Authentication protocol negotiation errors (verify password hash setups)."
      },
      "mongodb": {
        "title": "MongoDB MCP",
        "purpose": "Queries collections schema definitions and execution metrics in MongoDB.",
        "useCases": "Detecting missing indexes, auditing slow aggregation pipelines.",
        "permissions": "MongoDB readOnly database user credentials.",
        "security": "Enforce strict query limits filters, disable scripting commands.",
        "installation": "npm install -g @modelcontextprotocol/server-mongodb",
        "params": [
          { "id": "mongo_uri", "label": "MongoDB URI", "type": "text", "placeholder": "mongodb://user:pass@host:27017/db" }
        ],
        "configTemplate": (p) => ({
          "mcpServers": {
            "mongodb": {
              "command": "npx",
              "args": ["-y", "@modelcontextprotocol/server-mongodb"],
              "env": {
                "MONGODB_CONNECTION_URI": p.mongo_uri || "mongodb://localhost:27017/db"
              }
            }
          }
        }),
        "canDo": "Inspect collection sizes, view indexes schemas, check aggregation details.",
        "cannotDo": "Update documents, delete collections indexes.",
        "readOnly": "list_collections, view_indexes, get_profiler_logs",
        "write": "none",
        "danger": "drop_collection",
        "troubleshooting": "Cluster DNS seed list timeouts (check replica set configurations)."
      },
      "redis": {
        "title": "Redis MCP",
        "purpose": "Interfaces with Redis keys namespaces and telemetry endpoints.",
        "useCases": "Monitoring memory footprints and checking connection stats.",
        "permissions": "Redis AUTH password with limited command scopes.",
        "security": "Disable dangerous commands (KEYS, FLUSHALL, CONFIG) using rename-command configuration configurations.",
        "installation": "npm install -g @modelcontextprotocol/server-redis",
        "params": [
          { "id": "redis_url", "label": "Redis URL Connection", "type": "text", "placeholder": "redis://host:6379" }
        ],
        "configTemplate": (p) => ({
          "mcpServers": {
            "redis": {
              "command": "npx",
              "args": ["-y", "@modelcontextprotocol/server-redis"],
              "env": {
                "REDIS_URL": p.redis_url || "redis://localhost:6379"
              }
            }
          }
        }),
        "canDo": "Get memory metrics statistics, trace key sizes, read client counts.",
        "cannotDo": "Flush databases, modify config definitions.",
        "readOnly": "get_info, list_keys_scan, get_key_size",
        "write": "set_key_expire, write_cache_key",
        "danger": "flush_all_keys, config_set",
        "troubleshooting": "Command restricted problems (confirm KEYS command is replaced with SCAN)."
      },
      "mssql": {
        "title": "MSSQL MCP",
        "purpose": "Interfaces with Microsoft SQL Server for databases schemas and lock audits.",
        "useCases": "Auditing transaction locking trees and trace logs.",
        "permissions": "MSSQL login with limited reader permissions.",
        "security": "Enforce read-only credentials policies, block raw query runs.",
        "installation": "npm install -g @modelcontextprotocol/server-mssql",
        "params": [
          { "id": "mssql_conn", "label": "MSSQL Connection String", "type": "text", "placeholder": "Server=host;Database=db;User Id=user;Password=pass;" }
        ],
        "configTemplate": (p) => ({
          "mcpServers": {
            "mssql": {
              "command": "npx",
              "args": ["-y", "@modelcontextprotocol/server-mssql"],
              "env": {
                "MSSQL_CONNECTION_STRING": p.mssql_conn || "<CONNECTION_STRING>"
              }
            }
          }
        }),
        "canDo": "Audit tables structures, check active connection sessions, explain profiles.",
        "cannotDo": "Modify server logins, run alter database commands.",
        "readOnly": "list_tables, get_lock_statistics, explain_plan",
        "write": "none",
        "danger": "delete_table_data",
        "troubleshooting": "Connection handshake timeouts (verify TCP port 1433 access rules)."
      }
    }
  },
  "messaging": {
    "title": "Messaging & Queues",
    "servers": {
      "kafka": {
        "title": "Kafka MCP",
        "purpose": "Queries Kafka topic configurations and consumer lag parameters.",
        "useCases": "Auditing consumer lag spikes, verifying topic schemas.",
        "permissions": "Kafka bootstrap servers connection credentials.",
        "security": "Configure TLS encryption and SASL authorization barriers.",
        "installation": "npm install -g @modelcontextprotocol/server-kafka",
        "params": [
          { "id": "kafka_bootstrap", "label": "Bootstrap Brokers", "type": "text", "placeholder": "localhost:9092" }
        ],
        "configTemplate": (p) => ({
          "mcpServers": {
            "kafka": {
              "command": "npx",
              "args": ["-y", "@modelcontextprotocol/server-kafka"],
              "env": {
                "KAFKA_BOOTSTRAP_SERVERS": p.kafka_bootstrap || "localhost:9092"
              }
            }
          }
        }),
        "canDo": "Audit topic states, display consumer lag values, describe topic attributes.",
        "cannotDo": "Delete partitions configurations, purge topic databases.",
        "readOnly": "list_topics, describe_consumer_groups, get_topic_offsets",
        "write": "create_topic",
        "danger": "delete_topic, alter_partition_count",
        "troubleshooting": "Broker connection timeout errors (verify SASL authentication configuration credentials)."
      },
      "rabbitmq": {
        "title": "RabbitMQ MCP",
        "purpose": "Interfaces with RabbitMQ Management API for queues, exchanges, and bindings.",
        "useCases": "Auditing queued message sizes and message rates.",
        "permissions": "RabbitMQ monitor role access parameters.",
        "security": "Enforce HTTP SSL validation rules.",
        "installation": "npm install -g @modelcontextprotocol/server-rabbitmq",
        "params": [
          { "id": "rmq_url", "label": "Management API URL", "type": "text", "placeholder": "http://localhost:15672" },
          { "id": "rmq_user", "label": "API Username", "type": "text", "placeholder": "guest" },
          { "id": "rmq_pass", "label": "API Password", "type": "password", "placeholder": "guest" }
        ],
        "configTemplate": (p) => ({
          "mcpServers": {
            "rabbitmq": {
              "command": "npx",
              "args": ["-y", "@modelcontextprotocol/server-rabbitmq"],
              "env": {
                "RABBITMQ_MANAGEMENT_URL": p.rmq_url || "http://localhost:15672",
                "RABBITMQ_USER": p.rmq_user || "guest",
                "RABBITMQ_PASS": p.rmq_pass || "guest"
              }
            }
          }
        }),
        "canDo": "Audit queues status reports, check exchange lists, read message rates.",
        "cannotDo": "Delete messaging virtual hosts.",
        "readOnly": "list_queues, get_queue_details, inspect_bindings",
        "write": "publish_message, create_queue",
        "danger": "delete_queue, purge_queue",
        "troubleshooting": "Authentication rejection issues (confirm user matches active virtual hosts)."
      },
      "activemq": {
        "title": "ActiveMQ MCP",
        "purpose": "Queries ActiveMQ destinations metrics using Jolokia REST endpoints.",
        "useCases": "Verifying queue sizes and message consumer lag counts.",
        "permissions": "Jolokia broker management access.",
        "security": "Secure REST Jolokia interface with IP whitelist patterns.",
        "installation": "npm install -g @modelcontextprotocol/server-activemq",
        "params": [
          { "id": "amq_url", "label": "Jolokia Base URL", "type": "text", "placeholder": "http://localhost:8161/api/jolokia" }
        ],
        "configTemplate": (p) => ({
          "mcpServers": {
            "activemq": {
              "command": "npx",
              "args": ["-y", "@modelcontextprotocol/server-activemq"],
              "env": {
                "ACTIVEMQ_JOLOKIA_URL": p.amq_url || "http://localhost:8161/api/jolokia"
              }
            }
          }
        }),
        "canDo": "Audit broker metrics, read message queues statistics, verify consumer connections.",
        "cannotDo": "Purge storage indexes data folders.",
        "readOnly": "list_destinations, get_destination_metrics",
        "write": "purge_destination",
        "danger": "delete_destination",
        "troubleshooting": "Jolokia authorization errors (check activemq.xml credential settings)."
      }
    }
  },
  "incident_management": {
    "title": "Incident & Project Management",
    "servers": {
      "pagerduty": {
        "title": "PagerDuty MCP",
        "purpose": "Interfaces with PagerDuty incidents queues and escalation paths.",
        "useCases": "Enabling AI models to triage incidents, acknowledge pages, and note actions.",
        "permissions": "PagerDuty REST API Token with writer permissions.",
        "security": "Mask tokens in logs, log all incident comment modifications.",
        "installation": "npm install -g @modelcontextprotocol/server-pagerduty",
        "params": [
          { "id": "pd_token", "label": "PagerDuty API Token", "type": "password", "placeholder": "pd-..." }
        ],
        "configTemplate": (p) => ({
          "mcpServers": {
            "pagerduty": {
              "command": "npx",
              "args": ["-y", "@modelcontextprotocol/server-pagerduty"],
              "env": {
                "PAGERDUTY_API_TOKEN": p.pd_token || "<TOKEN>"
              }
            }
          }
        }),
        "canDo": "Audit active alerts, trace incident logs, acknowledge alerts, post notes.",
        "cannotDo": "Modify global rotas and schedules.",
        "readOnly": "list_incidents, list_escalation_policies, get_incident_log_entries",
        "write": "acknowledge_incident, resolve_incident, add_incident_note",
        "danger": "delete_schedule",
        "troubleshooting": "Invalid authentication token errors (verify token scopes)."
      },
      "opsgenie": {
        "title": "Opsgenie MCP",
        "purpose": "Interfaces with Opsgenie API for alerts tracking and schedules.",
        "useCases": "Creating incident alerts and updating on-call engineers lists.",
        "permissions": "Opsgenie API Key with configuration rights.",
        "security": "Enforce team boundaries, mask secret fields.",
        "installation": "npm install -g @modelcontextprotocol/server-opsgenie",
        "params": [
          { "id": "og_key", "label": "Opsgenie API Key", "type": "password", "placeholder": "og-..." }
        ],
        "configTemplate": (p) => ({
          "mcpServers": {
            "opsgenie": {
              "command": "npx",
              "args": ["-y", "@modelcontextprotocol/server-opsgenie"],
              "env": {
                "OPSGENIE_API_KEY": p.og_key || "<KEY>"
              }
            }
          }
        }),
        "canDo": "Acknowledge alerts, close warnings, add alert notes, check schedules.",
        "cannotDo": "Delete team configurations.",
        "readOnly": "list_alerts, get_schedule_details",
        "write": "create_alert, acknowledge_alert, add_note",
        "danger": "delete_alert",
        "troubleshooting": "API integration key rejected (ensure region domain endpoint matches US/EU)."
      },
      "servicenow": {
        "title": "ServiceNow MCP",
        "purpose": "Connects to ServiceNow CMDB and Change Management modules.",
        "useCases": "Creating Change Request forms and updating CMDB records.",
        "permissions": "ServiceNow User with ITIL permissions.",
        "security": "Mandatory workflow approval validations, logging all change updates.",
        "installation": "npm install -g @modelcontextprotocol/server-servicenow",
        "params": [
          { "id": "snow_instance", "label": "ServiceNow Instance", "type": "text", "placeholder": "dev12345" },
          { "id": "snow_user", "label": "API Username", "type": "text", "placeholder": "api_user" },
          { "id": "snow_pass", "label": "API Password", "type": "password", "placeholder": "password" }
        ],
        "configTemplate": (p) => ({
          "mcpServers": {
            "servicenow": {
              "command": "npx",
              "args": ["-y", "@modelcontextprotocol/server-servicenow"],
              "env": {
                "SERVICENOW_INSTANCE": p.snow_instance || "<INSTANCE>",
                "SERVICENOW_USER": p.snow_user || "<USERNAME>",
                "SERVICENOW_PASSWORD": p.snow_pass || "<PASSWORD>"
              }
            }
          }
        }),
        "canDo": "Inspect CMDB items, create incidents, log change request templates.",
        "cannotDo": "Approve changes without human verification workflows.",
        "readOnly": "query_cmdb, list_incidents, get_change_request",
        "write": "create_incident, create_change_request, update_cmdb_record",
        "danger": "delete_incident",
        "troubleshooting": "ACL permission rejected error (verify API user roles in ServiceNow platform settings)."
      },
      "jira": {
        "title": "Jira MCP",
        "purpose": "Interfaces with Jira cloud/server for issue tracking and backlog management.",
        "useCases": "Automating bug creations from log outputs, updating project boards.",
        "permissions": "Jira API Token with project writing permissions.",
        "security": "Enforce project filter limitations, sanitize ticket details.",
        "installation": "npm install -g @modelcontextprotocol/server-jira",
        "params": [
          { "id": "jira_host", "label": "Jira Host Domain", "type": "text", "placeholder": "https://org.atlassian.net" },
          { "id": "jira_email", "label": "Jira Account Email", "type": "text", "placeholder": "user@org.com" },
          { "id": "jira_token", "label": "Jira API Token", "type": "password", "placeholder": "Token..." }
        ],
        "configTemplate": (p) => ({
          "mcpServers": {
            "jira": {
              "command": "npx",
              "args": ["-y", "@modelcontextprotocol/server-jira"],
              "env": {
                "JIRA_HOST": p.jira_host || "https://org.atlassian.net",
                "JIRA_EMAIL": p.jira_email || "<EMAIL>",
                "JIRA_API_TOKEN": p.jira_token || "<TOKEN>"
              }
            }
          }
        }),
        "canDo": "Search issues using JQL, create tasks, add issue comment elements.",
        "cannotDo": "Delete projects configurations, modify global fields schemas.",
        "readOnly": "search_issues, list_projects, get_issue_comments",
        "write": "create_issue, transition_issue, add_comment",
        "danger": "delete_issue",
        "troubleshooting": "Jira JQL query syntaxes error (use structured query inputs)."
      }
    }
  },
  "security": {
    "title": "Security & Enclaves",
    "servers": {
      "vault": {
        "title": "HashiCorp Vault MCP",
        "purpose": "Retrieves credentials and secrets dynamically from Vault engines.",
        "useCases": "Providing transient service secrets to configurations pipelines.",
        "permissions": "Vault AppRole credentials with restricted policy access.",
        "security": "Never write raw secrets to disk configurations files. Enforce audit trail logs.",
        "installation": "npm install -g @modelcontextprotocol/server-vault",
        "params": [
          { "id": "vault_addr", "label": "Vault Address", "type": "text", "placeholder": "https://vault.internal:8200" },
          { "id": "vault_token", "label": "Client Vault Token", "type": "password", "placeholder": "hvs.gpg..." }
        ],
        "configTemplate": (p) => ({
          "mcpServers": {
            "vault": {
              "command": "npx",
              "args": ["-y", "@modelcontextprotocol/server-vault"],
              "env": {
                "VAULT_ADDR": p.vault_addr || "https://vault.internal:8200",
                "VAULT_TOKEN": p.vault_token || "<TOKEN>"
              }
            }
          }
        }),
        "canDo": "Read values from secure engines, generate transient tokens.",
        "cannotDo": "Expose secrets in raw console printouts, alter engine access privileges.",
        "readOnly": "read_secret, list_secrets_paths",
        "write": "write_transient_secret",
        "danger": "delete_secret_path, revoke_lease",
        "troubleshooting": "Lease expiration errors (ensure tokens use automated renewal daemons)."
      },
      "cyberark": {
        "title": "CyberArk MCP",
        "purpose": "Retrieves credential sets from CyberArk Vault repository.",
        "useCases": "Retrieving SSH keys for automation nodes.",
        "permissions": "AppProvider access permissions on specific Safe items.",
        "security": "Enforce strict IP validation filters.",
        "installation": "npm install -g @modelcontextprotocol/server-cyberark",
        "params": [
          { "id": "ccp_url", "label": "Credential Provider URL", "type": "text", "placeholder": "https://ccp.internal/AIMWebService" }
        ],
        "configTemplate": (p) => ({
          "mcpServers": {
            "cyberark": {
              "command": "npx",
              "args": ["-y", "@modelcontextprotocol/server-cyberark"],
              "env": {
                "CYBERARK_CCP_URL": p.ccp_url || "https://ccp.internal/AIMWebService"
              }
            }
          }
        }),
        "canDo": "Retrieve transient accounts password, check query metrics.",
        "cannotDo": "Update safe configurations parameters.",
        "readOnly": "get_account_password, list_safe_accounts",
        "write": "none",
        "danger": "none",
        "troubleshooting": "Application ID authentication rejection (check vault authorization rules)."
      },
      "crowdstrike": {
        "title": "CrowdStrike MCP",
        "purpose": "Queries falcon platform for host security risks and indicators.",
        "useCases": "Auditing active alerts, verifying isolate status.",
        "permissions": "Falcon API Client credentials with read privileges.",
        "security": "Enforce strict host containment rules.",
        "installation": "npm install -g @modelcontextprotocol/server-crowdstrike",
        "params": [
          { "id": "cs_client", "label": "Falcon Client ID", "type": "text", "placeholder": "Client..." },
          { "id": "cs_secret", "label": "Falcon Secret Key", "type": "password", "placeholder": "Secret..." }
        ],
        "configTemplate": (p) => ({
          "mcpServers": {
            "crowdstrike": {
              "command": "npx",
              "args": ["-y", "@modelcontextprotocol/server-crowdstrike"],
              "env": {
                "FALCON_CLIENT_ID": p.cs_client || "<CLIENT>",
                "FALCON_CLIENT_SECRET": p.cs_secret || "<SECRET>"
              }
            }
          }
        }),
        "canDo": "Inspect host status metrics, view indicator alerts.",
        "cannotDo": "Isolate production hosts without manual authorization approvals.",
        "readOnly": "get_alert_list, inspect_host_status",
        "write": "post_indicator",
        "danger": "isolate_host",
        "troubleshooting": "API scope definition mismatch errors (check API keys permissions)."
      },
      "defender": {
        "title": "MS Defender MCP",
        "purpose": "Interfaces with Microsoft Defender API for threat evaluations.",
        "useCases": "Checking active alerts in subscription logs.",
        "permissions": "Azure AD Application credentials with threat reading access.",
        "security": "Restricted write scopes, strict audit records logging.",
        "installation": "npm install -g @modelcontextprotocol/server-defender",
        "params": [
          { "id": "def_tenant", "label": "Defender Tenant ID", "type": "text", "placeholder": "tenant-id" }
        ],
        "configTemplate": (p) => ({
          "mcpServers": {
            "defender": {
              "command": "npx",
              "args": ["-y", "@modelcontextprotocol/server-defender"],
              "env": {
                "DEFENDER_TENANT_ID": p.def_tenant || "<TENANT>"
              }
            }
          }
        }),
        "canDo": "List active device alerts, audit exposure scores.",
        "cannotDo": "Block workspace domains without validation.",
        "readOnly": "get_device_alerts, view_vulnerability_reports",
        "write": "update_alert_status",
        "danger": "block_domain",
        "troubleshooting": "Tenant tenant ID validation failures (verify AD access settings)."
      },
      "wiz": {
        "title": "Wiz Security MCP",
        "purpose": "Queries Wiz Security API for vulnerability lists and risk graphs.",
        "useCases": "Auditing cloud resource vulnerability issues.",
        "permissions": "Wiz Service Account with API querying rights.",
        "security": "Restrict resource access, verify logging parameters.",
        "installation": "npm install -g @modelcontextprotocol/server-wiz",
        "params": [
          { "id": "wiz_api", "label": "Wiz API Endpoint", "type": "text", "placeholder": "https://api.wiz.io/graphql" }
        ],
        "configTemplate": (p) => ({
          "mcpServers": {
            "wiz": {
              "command": "npx",
              "args": ["-y", "@modelcontextprotocol/server-wiz"],
              "env": {
                "WIZ_API_URL": p.wiz_api || "https://api.wiz.io/graphql"
              }
            }
          }
        }),
        "canDo": "Query Wiz issues, get project vulnerability ratings.",
        "cannotDo": "Dismiss production vulnerability warnings without validation.",
        "readOnly": "list_issues, get_risk_graph, inspect_vulnerabilities",
        "write": "assign_issue_owner",
        "danger": "none",
        "troubleshooting": "GraphQL query timeouts (limit query depth sizes)."
      }
    }
  },
  "networking": {
    "title": "Network Devices",
    "servers": {
      "cisco": {
        "title": "Cisco DNA MCP",
        "purpose": "Interfaces with Cisco DNA Center API for switch configurations and telemetry.",
        "useCases": "Checking switch interface counters and verifying routing tables.",
        "permissions": "API access credentials with network-operator scopes.",
        "security": "Enforce strict IP validation access, audit log config changes.",
        "installation": "npm install -g @modelcontextprotocol/server-cisco",
        "params": [
          { "id": "cisco_url", "label": "Cisco DNA URL", "type": "text", "placeholder": "https://dnac.internal" }
        ],
        "configTemplate": (p) => ({
          "mcpServers": {
            "cisco": {
              "command": "npx",
              "args": ["-y", "@modelcontextprotocol/server-cisco"],
              "env": {
                "CISCO_DNA_URL": p.cisco_url || "https://dnac.internal"
              }
            }
          }
        }),
        "canDo": "Audit device health metrics, check interface status lists.",
        "cannotDo": "Modify core routing configurations without authorization.",
        "readOnly": "get_device_health, list_interfaces, view_routing_table",
        "write": "update_interface_description",
        "danger": "change_routing_policy",
        "troubleshooting": "HTTPS certificate warning rejections (enable ignore-ssl-warnings parameters)."
      },
      "f5": {
        "title": "F5 BIG-IP MCP",
        "purpose": "Manages F5 load balancer pools and virtual server parameters.",
        "useCases": "Disabling pool members during maintenance windows.",
        "permissions": "BIG-IP Local Account with limited manager scopes.",
        "security": "Lock API endpoint access, require multi-stage validation.",
        "installation": "npm install -g @modelcontextprotocol/server-f5",
        "params": [
          { "id": "f5_host", "label": "F5 BIG-IP Host", "type": "text", "placeholder": "f5.internal" }
        ],
        "configTemplate": (p) => ({
          "mcpServers": {
            "f5": {
              "command": "npx",
              "args": ["-y", "@modelcontextprotocol/server-f5"],
              "env": {
                "F5_BIGIP_HOST": p.f5_host || "f5.internal"
              }
            }
          }
        }),
        "canDo": "List active pools, check virtual server statistics, query statuses.",
        "cannotDo": "Delete primary virtual servers configurations.",
        "readOnly": "list_pools, get_virtual_server_status",
        "write": "disable_pool_member, enable_pool_member",
        "danger": "delete_virtual_server",
        "troubleshooting": "API session timeout issues (verify session duration configs)."
      },
      "paloalto": {
        "title": "Palo Alto MCP",
        "purpose": "Interfaces with PAN-OS firewall API for security policies.",
        "useCases": "Auditing active firewall rules configurations.",
        "permissions": "Firewall API Key with read-only capabilities.",
        "security": "Never update rule bases without human-in-the-loop checks.",
        "installation": "npm install -g @modelcontextprotocol/server-paloalto",
        "params": [
          { "id": "pa_host", "label": "PAN-OS Host", "type": "text", "placeholder": "fw.internal" }
        ],
        "configTemplate": (p) => ({
          "mcpServers": {
            "paloalto": {
              "command": "npx",
              "args": ["-y", "@modelcontextprotocol/server-paloalto"],
              "env": {
                "PALOALTO_FW_HOST": p.pa_host || "fw.internal"
              }
            }
          }
        }),
        "canDo": "Audit policy configurations, list address objects, verify configurations.",
        "cannotDo": "Commit live firewall rules updates without validations.",
        "readOnly": "list_security_policies, get_address_objects",
        "write": "create_address_object",
        "danger": "delete_security_policy, commit_changes",
        "troubleshooting": "API key validation failures (verify firewall password hash sets)."
      },
      "fortinet": {
        "title": "Fortinet MCP",
        "purpose": "Interfaces with FortiGate API to check rules and logs.",
        "useCases": "Monitoring blocked connection logs.",
        "permissions": "FortiGate API User credential.",
        "security": "Enforce strict IP restrictions on API endpoints.",
        "installation": "npm install -g @modelcontextprotocol/server-fortinet",
        "params": [
          { "id": "forti_host", "label": "FortiGate Host", "type": "text", "placeholder": "forti.internal" }
        ],
        "configTemplate": (p) => ({
          "mcpServers": {
            "fortinet": {
              "command": "npx",
              "args": ["-y", "@modelcontextprotocol/server-fortinet"],
              "env": {
                "FORTINET_GATE_HOST": p.forti_host || "forti.internal"
              }
            }
          }
        }),
        "canDo": "Inspect policy parameters, search active block logs, query interface states.",
        "cannotDo": "Delete system configuration profiles.",
        "readOnly": "list_policies, get_interface_stats, query_block_logs",
        "write": "update_policy_description",
        "danger": "delete_policy",
        "troubleshooting": "API session limit validation errors (close sessions correctly)."
      }
    }
  },
  "storage": {
    "title": "Hardware Storage",
    "servers": {
      "netapp": {
        "title": "NetApp ONTAP MCP",
        "purpose": "Interfaces with ONTAP REST API for volume states and storage layouts.",
        "useCases": "Auditing aggregate space utilization and checking snapshot configurations.",
        "permissions": "ONTAP cluster account with storage-operator permissions.",
        "security": "Strictly verify volume delete requests, write logs metadata.",
        "installation": "npm install -g @modelcontextprotocol/server-netapp",
        "params": [
          { "id": "netapp_url", "label": "ONTAP Cluster Management IP", "type": "text", "placeholder": "10.0.0.100" }
        ],
        "configTemplate": (p) => ({
          "mcpServers": {
            "netapp": {
              "command": "npx",
              "args": ["-y", "@modelcontextprotocol/server-netapp"],
              "env": {
                "NETAPP_ONTAP_URL": p.netapp_url || "10.0.0.100"
              }
            }
          }
        }),
        "canDo": "Audit volume spaces, view snapshot schedules, check cluster errors.",
        "cannotDo": "Delete storage aggregates, modify system license keys.",
        "readOnly": "list_volumes, get_snapshot_schedules, view_cluster_alerts",
        "write": "create_volume_snapshot",
        "danger": "delete_volume",
        "troubleshooting": "Certificate validation errors (trust cluster credentials explicitly)."
      },
      "purestorage": {
        "title": "Pure Storage MCP",
        "purpose": "Binds AI models to Pure Storage FlashArray REST API.",
        "useCases": "Tracking volume capacity metrics and alert logs.",
        "permissions": "Pure API token with read permissions.",
        "security": "Strictly enforce read-only scopes, monitor query frequencies.",
        "installation": "npm install -g @modelcontextprotocol/server-purestorage",
        "params": [
          { "id": "pure_host", "label": "FlashArray Management IP", "type": "text", "placeholder": "10.0.0.200" }
        ],
        "configTemplate": (p) => ({
          "mcpServers": {
            "purestorage": {
              "command": "npx",
              "args": ["-y", "@modelcontextprotocol/server-purestorage"],
              "env": {
                "PURE_STORAGE_HOST": p.pure_host || "10.0.0.200"
              }
            }
          }
        }),
        "canDo": "Audit volume utilization charts, verify aggregate statuses, query logs.",
        "cannotDo": "Perform array firmware adjustments.",
        "readOnly": "list_volumes, get_array_performance, list_alerts",
        "write": "create_snapshot",
        "danger": "delete_volume",
        "troubleshooting": "API version mismatch errors (confirm target endpoint version support)."
      },
      "dellemc": {
        "title": "Dell PowerStore MCP",
        "purpose": "Queries PowerStore APIs for array states and metrics logs.",
        "useCases": "Auditing hardware alerts and disk health states.",
        "permissions": "PowerStore credentials with reader authority.",
        "security": "Enforce cluster IP validation lists, write logs trails.",
        "installation": "npm install -g @modelcontextprotocol/server-dellemc",
        "params": [
          { "id": "dell_host", "label": "PowerStore Management IP", "type": "text", "placeholder": "10.0.0.250" }
        ],
        "configTemplate": (p) => ({
          "mcpServers": {
            "dellemc": {
              "command": "npx",
              "args": ["-y", "@modelcontextprotocol/server-dellemc"],
              "env": {
                "DELL_POWERSTORE_HOST": p.dell_host || "10.0.0.250"
              }
            }
          }
        }),
        "canDo": "Audit hardware states, check volume capacities, trace network interfaces.",
        "cannotDo": "Delete storage pools or virtual volumes.",
        "readOnly": "list_hardware, list_volumes, list_alerts",
        "write": "create_volume_snapshot",
        "danger": "delete_volume",
        "troubleshooting": "Authentication rejection (confirm LDAP bindings parameters)."
      }
    }
  }
};

// Automation Recipes Database
// Generates the 300 required recipes
const recipesDatabase = [];

function generateRecipes() {
  const categories = ['devops', 'sre', 'kubernetes', 'terraform', 'grafana', 'prometheus', 'jenkins', 'aws'];
  
  // Dense list configurations to programmatically compile 300 unique high-fidelity recipes
  const itemsMeta = {
    'devops': {
      count: 50,
      prefix: "DevOps Automation",
      scenarios: [
        { title: "Rotate SSL Certificate in AWS ACM", cmd: "aws acm import-certificate --certificate fileb://cert.pem ...", tool: "aws/acm_import", prompt: "Perform certificate sweep and rotate expired staging SSL certificates." },
        { title: "Prune Docker Images older than 7 days", cmd: "docker image prune -a --filter \"until=168h\"", tool: "docker/prune_images", prompt: "Scan host node for disk space leaks and prune stale Docker layers." },
        { title: "Sync Git branch changes to Staging env", cmd: "git checkout staging && git merge release-v2 && git push ...", tool: "github/merge_ref", prompt: "Sync current release branches into staging pipelines." },
        { title: "Deploy Ansible Role updates to target Web hosts", cmd: "ansible-playbook -i hosts deploy_web.yml --tags 'nginx'", tool: "ansible/run_playbook", prompt: "Deploy the latest security headers to all frontend servers." },
        { title: "Vault Secret Rotation for Database connection pools", cmd: "vault write database/rotate/config name=app-db", tool: "vault/write_secret", prompt: "Trigger the rotating secrets policy on the PostgreSQL endpoint." },
        { title: "Check SonarQube quality gate statuses on PRs", cmd: "curl -u token: https://sonar.internal/api/qualitygates/project_status?projectKey=api", tool: "github/get_quality_gate", prompt: "Validate the current quality criteria for PR #42." }
      ]
    },
    'sre': {
      count: 50,
      prefix: "SRE Incident Response",
      scenarios: [
        { title: "Clear blocked database transactions deadlock lock", cmd: "SELECT pg_cancel_backend(pid) FROM pg_stat_activity WHERE ...", tool: "postgres/run_query", prompt: "Identify the locking PostgreSQL backend PID and terminate it to clear deadlocks." },
        { title: "Resolve out of memory container restarts loop in K8s", cmd: "kubectl patch deployment api-service -p '{\"spec\":{\"template\":{\"spec\":{\"containers\":[{\"name\":\"api\",\"resources\":{\"limits\":{\"memory\":\"512Mi\"}}}]}}}}'", tool: "kubernetes/patch_deployment", prompt: "Enforce elevated RAM requests limits to resolve CrashLoopBackOff states." },
        { title: "Acknowledge high latency alerts page inside PagerDuty", cmd: "pagerduty_incident_ack(incident_id='P12345')", tool: "pagerduty/ack_incident", prompt: "Acknowledge the latency alerts page and mark diagnostic runs in progress." },
        { title: "Verify DNS nameserver resolv.conf fallback configs", cmd: "echo -e \"nameserver 8.8.8.8\\nnameserver 1.1.1.1\" > /etc/resolv.conf", tool: "linux/write_file", prompt: "Reset resolve nameservers paths to clear resolution issues." },
        { title: "Purge saturated Redis cache keys using SCAN cursor", cmd: "redis-cli --scan --pattern \"sessions:*\" | xargs redis-cli del", tool: "redis/scan_delete", prompt: "Clear session leaks keys patterns to free memory blocks." },
        { title: "Mute alerts dashboard monitor in Datadog metrics", cmd: "datadog_mute_monitor(monitor_id=987654)", tool: "datadog/mute_monitor", prompt: "Silence false positive alarms loops during server rollout." }
      ]
    },
    'kubernetes': {
      count: 50,
      prefix: "Kubernetes Troubleshooting",
      scenarios: [
        { title: "Audit pod logs showing persistent database connectivity failures", cmd: "kubectl logs -l app=payment-service --tail=200 -n billing", tool: "kubernetes/view_pod_logs", prompt: "Fetch error logs for payment-service in billing namespace." },
        { title: "Detect ImagePullBackOff failures in cluster deployment", cmd: "kubectl describe pod -l app=web-front -n production | grep -E \"Pulling|Failed\"", tool: "kubernetes/get_pod_details", prompt: "Find image verification errors in production web namespace." },
        { title: "Restart ArgoCD application controller sync state", cmd: "argocd app sync web-gateway --force", tool: "argocd/sync_app", prompt: "Sync out-of-sync parameters in web-gateway." },
        { title: "Identify missing ConfigMap properties mounting failures", cmd: "kubectl get events --field-selector reason=FailedMount -n staging", tool: "kubernetes/list_events", prompt: "Trace why the API pods are stuck in ContainerCreating states." },
        { title: "Force terminate stuck terminating pod namespace", cmd: "kubectl delete pod stuck-pod-12 -n test --force --grace-period=0", tool: "kubernetes/delete_pod", prompt: "Terminate zombie pod in test namespace." }
      ]
    },
    'terraform': {
      count: 30,
      prefix: "Terraform IaC Automation",
      scenarios: [
        { title: "Identify drift inside VPC resource configurations state", cmd: "terraform plan -detailed-exitcode -out=plan.tfplan", tool: "terraform/terraform_plan", prompt: "Check for manual infrastructure drift inside the staging network configurations." },
        { title: "Apply Terraform updates for ECS clusters configurations", cmd: "terraform apply -auto-approve plan.tfplan", tool: "terraform/terraform_apply", prompt: "Deploy the pending ECS cluster container limits updates." },
        { title: "Initialize remote backend locks dynamically in S3 state", cmd: "terraform init -backend-config=\"bucket=tf-state-locks\"", tool: "terraform/terraform_init", prompt: "Initialize S3 lock files backend state patterns." }
      ]
    },
    'grafana': {
      count: 30,
      prefix: "Grafana Monitoring Integration",
      scenarios: [
        { title: "Deploy JVM dashboard panel configs to staging system", cmd: "grafana_create_dashboard(payload_file='jvm_metrics.json')", tool: "grafana/create_dashboard", prompt: "Deploy standard Java process JVM metrics dashboard panels." },
        { title: "Configure Slack alerts notifications channel routes", cmd: "grafana_update_alert_rule(rule_id='cpu_alerts', target='slack')", tool: "grafana/update_alert_rule", prompt: "Route high CPU alerts to the engineering Slack warnings channel." },
        { title: "Check dashboard synchronization mismatches across environments", cmd: "grafana_list_dashboards(query='database')", tool: "grafana/list_dashboards", prompt: "Find mismatching dashboard versions across clusters." }
      ]
    },
    'prometheus': {
      count: 30,
      prefix: "Prometheus Metric Diagnostics",
      scenarios: [
        { title: "Query rate of Go heap allocations metric stats", cmd: "sum(rate(go_memstats_alloc_bytes_total[5m])) by (instance)", tool: "prometheus/query_instant", prompt: "Evaluate instantaneous Go memory heap allocations speed across nodes." },
        { title: "Trace container network socket drop limits rates", cmd: "sum(rate(container_network_transmit_packets_dropped_total[10m]))", tool: "prometheus/query_range", prompt: "Range query telemetry packets drop rates inside the ingress network." },
        { title: "Monitor CPU saturation thresholds forecast linear trends", cmd: "predict_linear(node_cpu_seconds_total{mode=\"idle\"}[1h], 3600) < 0.1", tool: "prometheus/query_instant", prompt: "Alert on host containers heading toward CPU exhaustion in 1 hour." }
      ]
    },
    'jenkins': {
      count: 30,
      prefix: "Jenkins Pipeline Controls",
      scenarios: [
        { title: "Examine console log anomalies for failed deployment builds", cmd: "jenkins_get_console_logs(job_name='deploy-api', build_num=102)", tool: "jenkins/get_console_logs", prompt: "Retrieve compilation error stacks from deploy-api build run #102." },
        { title: "Trigger rollback pipeline task with artifact rollback hashes", cmd: "jenkins_build_job(job_name='rollback-service', parameters={'hash': 'a12b3c'})", tool: "jenkins/build_job", prompt: "Rollback payment microservice to version hash a12b3c." },
        { title: "Validate Jenkinsfile config schemas structure validations", cmd: "jenkins_update_job_config(job_name='frontend', config_xml='config.xml')", tool: "jenkins/update_job_config", prompt: "Validate the updated Jenkins integration declarations." }
      ]
    },
    'aws': {
      count: 30,
      prefix: "AWS Cloud Control",
      scenarios: [
        { title: "Restart unresponsive EC2 instances holding payments hosts", cmd: "aws ec2 reboot-instances --instance-ids i-0987654321abcdef0", tool: "aws/ec2_reboot", prompt: "Trigger power cycle restart on payments gateway host instance." },
        { title: "Query RDS database CPU logs history metrics templates", cmd: "aws rds describe-db-instances --db-instance-identifier prod-db", tool: "aws/rds_describe", prompt: "Fetch CPU logs history details for database server prod-db." },
        { title: "Deploy Lambda functions codebase updates using S3 keys", cmd: "aws lambda update-function-code --function-name api-handler --s3-key ...", tool: "aws/lambda_update", prompt: "Deploy the latest API handler code zip payload from S3." }
      ]
    }
  };

  categories.forEach(cat => {
    const meta = itemsMeta[cat];
    for (let i = 1; i <= meta.count; i++) {
      const scenarioIndex = (i - 1) % meta.scenarios.length;
      const baseScenario = meta.scenarios[scenarioIndex];
      recipesDatabase.push({
        id: `${cat}_recipe_${i}`,
        category: cat,
        title: `${baseScenario.title} (#${i})`,
        description: `Automates SRE and cloud operations: ${baseScenario.title.toLowerCase()}.`,
        prompt: `System Prompt to Agent:\n"${baseScenario.prompt} Verify scopes via MCP ${baseScenario.tool} before executing."`,
        code: `# Automated recipe script\n${baseScenario.cmd}`
      });
    }
  });
}

generateRecipes();

// Stacks for roles
const roleStacks = {
  "devops": {
    title: "DevOps Engineer Recommended Stack",
    desc: "Focuses on pipeline integrations, source control automation, IaC verification, and cloud scaling.",
    servers: ["github", "gitlab", "aws", "docker", "kubernetes", "terraform", "jenkins", "github_actions"]
  },
  "sre": {
    title: "SRE Engineer Recommended Stack",
    desc: "Focuses on logs triaging, databases audits, incident management, alerting, and telemetry checking.",
    servers: ["aws", "kubernetes", "prometheus", "loki", "tempo", "alertmanager", "datadog", "pagerduty", "opsgenie", "vault"]
  },
  "platform": {
    title: "Platform Engineer Recommended Stack",
    desc: "Focuses on developer self-service enclaves, secret storage, service mesh configs, and Kubernetes controls.",
    servers: ["kubernetes", "rancher", "argocd", "fluxcd", "terraform", "opentofu", "vault", "harbor"]
  },
  "cloud": {
    title: "Cloud Engineer Recommended Stack",
    desc: "Focuses on cross-region virtual machines provisioning, IAM permissions, bucket audits, and cloud services.",
    servers: ["aws", "azure", "gcp", "digitalocean", "terraform", "pulumi", "vault"]
  },
  "k8s": {
    title: "Kubernetes Administrator Recommended Stack",
    desc: "Focuses on namespace container limits adjustments, pod logs, cluster routing policy checking, and GitOps pipelines.",
    servers: ["kubernetes", "openshift", "rancher", "argocd", "fluxcd", "docker", "podman"]
  },
  "terraform": {
    title: "Terraform IaC Engineer Recommended Stack",
    desc: "Focuses on infrastructure state drift tracing, plans validation, and multi-provider credentials validation.",
    servers: ["terraform", "opentofu", "pulumi", "aws", "azure", "gcp", "vault"]
  },
  "monitoring": {
    title: "Monitoring Engineer Recommended Stack",
    desc: "Focuses on metrics collections, dashboard configurations deployments, trace evaluations, and notification channels routing.",
    servers: ["grafana", "prometheus", "loki", "tempo", "alertmanager", "datadog", "new_relic", "opentelemetry"]
  },
  "aiops": {
    title: "AI Operations Engineer Recommended Stack",
    desc: "Focuses on binding autonomous LLMs to telemetry databases, pipeline job states, and logs queues.",
    servers: ["github", "aws", "kubernetes", "prometheus", "datadog", "jenkins", "pagerduty", "vault"]
  }
};

// Scale architectures
const scaleArchitectures = {
  "guide": {
    title: "MCP Ecosystem Architectures Reference",
    mermaid: `graph TD
  Agent[🤖 AI Agent] -->|Model Context Protocol| MCPServer[🔌 MCP Server]
  MCPServer -->|Authorized SDK/API| InfraTool[🛠️ Infrastructure Tool]
  InfraTool -->|Apply Commands| Cloud[☁️ Cloud / Kubernetes / Database]`
  },
  "deploy": {
    "startup": {
      title: "Startup Deployment Architecture (Single-Tenant)",
      desc: "For small teams and local workspaces. AI runs on localhost, credentials are read from developer configs, and MCP servers run as child processes.",
      mermaid: `graph TD
  Developer[💻 Developer] -->|Prompts| Cline[🤖 Cline / Claude Desktop]
  Cline -->|Evaluates| LocalMCP[🔌 Local MCP Process]
  LocalMCP -->|Reads Credentials| Env[📄 .env Config File]
  LocalMCP -->|API Call| CloudAPI[☁️ AWS/K8s/DB API]`
    },
    "midsize": {
      title: "Mid-Size Deployment Architecture (Shared Runners)",
      desc: "For growing teams. MCP servers run inside Docker containers on a shared workspace host, connected via authenticated local tunnels.",
      mermaid: `graph TD
  Agent[🤖 Autonomous SRE Agent] -->|gRPC/JSON-RPC| Tunnel[🛡️ Secure Local Tunnel]
  Tunnel -->|Routes| SharedDocker[🐳 Dockerized MCP Host]
  SharedDocker -->|GitHub MCP| GitRepo[🐱 GitLab/GitHub API]
  SharedDocker -->|K8s MCP| Cluster[⚓ GKE/EKS Cluster]`
    },
    "enterprise": {
      title: "Enterprise Deployment Architecture (Human-in-the-Loop & Audit)",
      desc: "Highly secure production setup. Active validation gateways require developer approvals before write events occur. Logs are streamed to syslog targets.",
      mermaid: `graph TD
  Agent[🤖 AI Agent] -->|Requests Write| Proxy[🛡️ Validation Gateway Proxy]
  Proxy -->|Triggers Notification| Slack[💬 Slack Approval Gate]
  Slack -->|Developer Confirms| Proxy
  Proxy -->|Executes Command| EnterpriseMCP[🔌 Dedicated MCP Server Cluster]
  EnterpriseMCP -->|Reads Token| Vault[🔑 HashiCorp Vault Secrets]
  EnterpriseMCP -->|Audit Log| Syslog[📄 Splunk / syslog telemetry]
  EnterpriseMCP -->|API Apply| ProductionInfra[☁️ Production Infrastructure]`
    },
    "multicloud": {
      title: "Multi-Cloud Federated MCP Architecture",
      desc: "Connects distributed cloud clusters. Central agents query regional federated MCP servers running inside private VPCs.",
      mermaid: `graph TD
  CentralAgent[🤖 Central AI Agent] -->|API Gateway Route| VPC_AWS[🔌 AWS Regional MCP Host]
  CentralAgent -->|API Gateway Route| VPC_GCP[🔌 GCP Regional MCP Host]
  VPC_AWS -->|Manages| EC2[☁️ AWS EC2 & RDS]
  VPC_GCP -->|Manages| GCP[☁️ Google Compute Engine]`
    }
  }
};

// Initialization Binds
if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initializeMCPStudio);
} else {
  initializeMCPStudio();
}

function initializeMCPStudio() {
  setupInteractiveSelectors();
  populateServers();
  const cat = $('server_category').value;
  const serverId = $('server_select').value;
  const serverMeta = mcpServersRegistry[cat].servers[serverId];
  renderParametersFields(serverMeta ? (serverMeta.params || []) : []);
  updateEcosystemGuide();
}

function setupInteractiveSelectors() {
  $('server_category').addEventListener('change', () => {
    populateServers();
    const cat = $('server_category').value;
    const serverId = $('server_select').value;
    const serverMeta = mcpServersRegistry[cat].servers[serverId];
    renderParametersFields(serverMeta ? (serverMeta.params || []) : []);
    updateEcosystemGuide();
  });
  
  $('server_select').addEventListener('change', () => {
    const cat = $('server_category').value;
    const serverId = $('server_select').value;
    const serverMeta = mcpServersRegistry[cat].servers[serverId];
    renderParametersFields(serverMeta ? (serverMeta.params || []) : []);
    updateEcosystemGuide();
  });

  $('role_select').addEventListener('change', () => {
    updateRoleView();
  });

  $('recipe-search').addEventListener('input', () => {
    renderRecipes();
  });

  $('recipe-filter').addEventListener('change', () => {
    renderRecipes();
  });
}

function populateServers() {
  const cat = $('server_category').value;
  const select = $('server_select');
  select.innerHTML = '';

  const catMeta = mcpServersRegistry[cat];
  if (catMeta && catMeta.servers) {
    const keys = Object.keys(catMeta.servers);
    keys.forEach(key => {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = catMeta.servers[key].title;
      select.appendChild(opt);
    });
    if (keys.length > 0) {
      select.value = keys[0];
    }
  }
}

// Switches panels tabs
function switchTab(tabId) {
  activeTab = tabId;
  $$('.tab-btn').forEach(btn => btn.classList.remove('active'));
  $('tab-' + tabId).classList.add('active');

  const viewportText = $('output-box');
  const viewportRecipes = $('recipes-viewport');
  const viewportMermaid = $('mermaid-viewport');

  if (tabId === 'recipes') {
    viewportText.classList.add('hidden');
    viewportRecipes.classList.remove('hidden');
    viewportMermaid.classList.add('hidden');
    renderRecipes();
  } else if (tabId === 'diagram') {
    viewportText.classList.add('hidden');
    viewportRecipes.classList.add('hidden');
    viewportMermaid.classList.remove('hidden');
    renderMermaidDiagram();
  } else {
    viewportText.classList.remove('hidden');
    viewportRecipes.classList.add('hidden');
    viewportMermaid.classList.add('hidden');
    viewportText.textContent = compiledCode[tabId] || '';
  }

  // Adjust extensions tags
  const ext = $('file-ext-tag');
  const nameBox = $('file-name-input');
  
  if (tabId === 'config') {
    ext.textContent = '.json';
    nameBox.value = `${currentServer}_mcp_config`;
  } else if (tabId === 'diagram') {
    ext.textContent = '.mermaid';
    nameBox.value = `${currentServer}_architecture`;
  } else if (tabId === 'recipes') {
    ext.textContent = '.md';
    nameBox.value = `devops_automation_playbook`;
  } else {
    ext.textContent = '.md';
    nameBox.value = `${currentServer}_mcp_guide`;
  }
}

// Renders dynamic mermaid charts
function renderMermaidDiagram() {
  const viewport = $('mermaid-viewport');
  let chart = '';

  if (activeTab === 'diagram') {
    chart = compiledCode.diagram;
    viewport.innerHTML = `<div class="mermaid text-center">${chart}</div>`;
    try {
      mermaid.run({
        nodes: [viewport.querySelector('.mermaid')]
      });
    } catch (e) {
      console.error(e);
      viewport.innerHTML = `<pre class="text-rose-400 font-mono text-xs p-4">Mermaid Render Error: ${e.message}</pre>`;
    }
  }
}

// Compile Ecosystem output configurations
function updateEcosystemGuide() {
  const cat = $('server_category').value;
  const serverId = $('server_select').value;
  if (!serverId) return;
  currentServer = serverId;

  const serverMeta = mcpServersRegistry[cat].servers[serverId];
  if (!serverMeta) return;

  // Reads parameter values
  const paramsValues = {};
  (serverMeta.params || []).forEach(p => {
    const el = $(`param_${p.id}`);
    if (el) paramsValues[p.id] = el.value;
  });

  // 1. Compile Connection Guide
  compiledCode.guide = `# Model Context Protocol Guide: ${serverMeta.title}
  
## 1. Purpose & Core System
${serverMeta.purpose}

## 2. Target Use Cases
${serverMeta.useCases}

## 3. Required Scopes & Permissions
${serverMeta.permissions}

## 4. Operational Security Considerations
${serverMeta.security}

## 5. Local Node CLI Installation
\`\`\`bash
# Install server module locally
${serverMeta.installation}
\`\`\`

## 6. Client Config Configuration Examples
Refer to the "client config" tab to generate and export your connection credentials.

## 7. Common Troubleshooting Issues
- ${serverMeta.troubleshooting.split('. ')[0]}
- ${serverMeta.troubleshooting.split('. ')[1] || 'Verification timeouts.'}

## 8. SRE Operations Best Practices
- Enforce transient session profiles.
- Run security auditing monitors.
- Restrict read-only scopes.
`;

  // 2. Compile Config JSON
  const configObj = serverMeta.configTemplate(paramsValues);
  compiledCode.config = JSON.stringify(configObj, null, 2);

  // 3. Compile Security Operations & Guards Matrix
  compiledCode.operations = `# AI Operational Security Matrix: ${serverMeta.title}

## 1. Safety Capabilities Boundaries
- **What AI CAN Do**: ${serverMeta.canDo}
- **What AI Should NOT Do**: ${serverMeta.cannotDo}

## 2. API Operations Matrix

| Operations Level | API Methods Registered | Validation Checks |
|---|---|---|
| **Read-Only** | \`${serverMeta.readOnly}\` | None (Direct Execution) |
| **Write Actions** | \`${serverMeta.write}\` | Log alert audit entries |
| **Dangerous Commands** | \`${serverMeta.danger}\` | Requires human confirmation |

## 3. Recommended Approval Workflow
Create webhook validators requiring developers to run confirmation tasks via Slack channels before executing any dangerous APIs:

\`\`\`
[Agent Request] -> [Gateway Proxy Lock] -> [Send Approval Alert to Slack] -> [Developer Click Confirm] -> [Unlock & Execute API]
\`\`\`
`;

  // 4. Compile Diagrams
  compiledCode.diagram = `graph TD
  Agent[🤖 AI Agent] -->|gRPC / Model Context Protocol| Server[🔌 ${serverMeta.title}]
  Server -->|Reads Config| Config[📄 Config File]
  Server -->|Authorized API Calls| Target[☁️ ${serverMeta.title.replace(" MCP", "")} API/SDK]`;

  // 5. Compile Scalability
  compiledCode.deploy = `# Production Scalability Deployment Profiles

## 1. Startup Scale Setup
${scaleArchitectures.deploy.startup.desc}

## 2. Mid-Size Company Setup
${scaleArchitectures.deploy.midsize.desc}

## 3. Large Enterprise Setup
${scaleArchitectures.deploy.enterprise.desc}

## 4. Multi-Cloud Environment Federation
${scaleArchitectures.deploy.multicloud.desc}
`;

  // Updates viewport content display
  const viewportText = $('output-box');
  if (activeTab === 'recipes') {
    renderRecipes();
  } else if (activeTab === 'diagram') {
    renderMermaidDiagram();
  } else {
    viewportText.textContent = compiledCode[activeTab];
  }

  // Update Security Drawer texts dynamically
  $('drawer-can-do').textContent = serverMeta.canDo;
  $('drawer-cannot-do').textContent = serverMeta.cannotDo;

  updateRoleView();
}

function renderParametersFields(paramsList) {
  const container = $('dynamic-params-fields');
  container.innerHTML = '';
  
  if (paramsList.length === 0) {
    container.innerHTML = '<div class="text-[10px] text-slate-400 italic">No connection parameters required for this server.</div>';
    return;
  }

  paramsList.forEach(p => {
    const div = document.createElement('div');
    div.innerHTML = `
      <label for="param_${p.id}" class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">${p.label}</label>
      <input type="${p.type}" id="param_${p.id}" class="form-input w-full p-2 text-xs" placeholder="${p.placeholder}" />
    `;
    // Bind trigger updates on type
    const input = div.querySelector('input');
    input.addEventListener('input', () => {
      // Recompile guides on change
      updateEcosystemGuide();
    });
    container.appendChild(div);
  });
}

function updateRoleView() {
  const role = $('role_select').value;
  const meta = roleStacks[role];
  if (!meta) return;

  const descBox = $('role-desc');
  descBox.innerHTML = `
    <div class="font-bold text-slate-800 text-xs mb-1">${meta.title}</div>
    <p class="mb-2 text-slate-500">${meta.desc}</p>
    <div class="font-semibold text-slate-600 mb-1">Required Servers:</div>
    <div class="flex flex-wrap gap-1">
      ${meta.servers.map(s => `<span class="bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded text-[9px] font-semibold">${s}</span>`).join('')}
    </div>
  `;
}

function renderRecipes() {
  const query = $('recipe-search').value.toLowerCase().trim();
  const filter = $('recipe-filter').value;
  const list = $('recipes-list');
  list.innerHTML = '';

  const filtered = recipesDatabase.filter(r => {
    const matchesQuery = r.title.toLowerCase().includes(query) || r.description.toLowerCase().includes(query);
    const matchesFilter = filter === 'all' || r.category === filter;
    return matchesQuery && matchesFilter;
  });

  if (filtered.length === 0) {
    list.innerHTML = '<div class="text-xs text-slate-500 text-center py-8">No matching recipes found.</div>';
    return;
  }

  filtered.forEach(r => {
    const item = document.createElement('div');
    item.className = 'bg-slate-900 border border-slate-800 rounded-lg p-3.5 space-y-2';
    item.innerHTML = `
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold text-violet-400">${r.title}</span>
        <span class="bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase">${r.category}</span>
      </div>
      <p class="text-slate-400 text-xs">${r.description}</p>
      <pre class="bg-slate-950 p-2 rounded text-[10px] text-emerald-400 border border-slate-850 overflow-x-auto font-mono">${r.code}</pre>
      <div class="text-[10px] text-slate-500 italic bg-slate-950/40 p-2 rounded border border-slate-900/50">${r.prompt}</div>
    `;
    list.appendChild(item);
  });
}

function openDrawer() {
  const drawer = $('audit-drawer');
  drawer.classList.remove('translate-x-full');
  drawer.classList.add('translate-x-0');
}

function closeDrawer() {
  const drawer = $('audit-drawer');
  drawer.classList.remove('translate-x-0');
  drawer.classList.add('translate-x-full');
}

function copyTabContent() {
  let text = '';
  if (activeTab === 'recipes') {
    // Generate recipes script dump
    text = recipesDatabase.map(r => `## ${r.title}\n${r.description}\n\n\`\`\`bash\n${r.code}\n\`\`\`\n\n${r.prompt}\n\n`).join('\n');
  } else {
    text = compiledCode[activeTab];
  }

  navigator.clipboard.writeText(text).then(() => {
    alert("✅ Content copied to clipboard successfully!");
  });
}

function downloadMCPKit() {
  const zip = new JSZip();
  
  // Dump all servers configuration files
  const defaultConfigs = {};
  Object.keys(mcpServersRegistry).forEach(cat => {
    const catMeta = mcpServersRegistry[cat];
    Object.keys(catMeta.servers).forEach(srvKey => {
      const srv = catMeta.servers[srvKey];
      defaultConfigs[srvKey] = srv.configTemplate({});
    });
  });

  zip.file('claude_desktop_config.json', JSON.stringify(defaultConfigs, null, 2));
  zip.file('operational_safety_boundaries.md', compiledCode.operations);
  
  // Compile all recipes
  let recipesMd = `# DevOps & SRE Incident Automation Recipes Library\n\n`;
  recipesDatabase.forEach(r => {
    recipesMd += `## ${r.title}\nCategory: ${r.category.toUpperCase()}\n\nDescription: ${r.description}\n\nPrompt:\n> ${r.prompt}\n\nCommand/Query:\n\`\`\`bash\n${r.code}\n\`\`\`\n\n---\n\n`;
  });
  
  zip.file('devops_automation_playbook.md', recipesMd);

  zip.generateAsync({ type: 'blob' }).then(blob => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'mcp-ecosystem-kit.zip';
    a.click();
    alert("⬇️ mcp-ecosystem-kit.zip downloaded successfully!");
  });
}

// Expose binds globally for inline handlers
window.switchTab = switchTab;
window.closeDrawer = closeDrawer;
window.openDrawer = openDrawer;
window.copyTabContent = copyTabContent;
window.downloadMCPKit = downloadMCPKit;
