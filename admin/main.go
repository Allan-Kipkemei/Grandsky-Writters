package main

import (
  "encoding/json"
  "log"
  "math/rand"
  "net/http"
  "sync"
  "time"
)

var (
  mu         sync.Mutex
  adminToken = "super-secret-admin-token"
  jobs       = []Job{
    {
      ID:          "job-1",
      Title:       "Academic essay research",
      Category:    "Writing",
      Pay:         4200,
      Pages:       5,
      Deadline:    "48 hours",
      Description: "Prepare a polished 1500-word essay for a client who needs fast delivery.",
    },
    {
      ID:          "job-2",
      Title:       "Sales copy for product launch",
      Category:    "Marketing",
      Pay:         5400,
      Pages:       4,
      Deadline:    "72 hours",
      Description: "Write persuasive sales copy for a website landing page with a strong CTA.",
    },
  }
  members = []Member{
    {ID: "user-1", Email: "student1@example.com", Activated: false},
    {ID: "user-2", Email: "student2@example.com", Activated: false},
  }
)

type Job struct {
  ID          string `json:"id"`
  Title       string `json:"title"`
  Category    string `json:"category"`
  Pay         int    `json:"pay"`
  Pages       int    `json:"pages"`
  Deadline    string `json:"deadline"`
  Description string `json:"description"`
}

type Member struct {
  ID        string `json:"id"`
  Email     string `json:"email"`
  Activated bool   `json:"activated"`
}

type dashboardResponse struct {
  TotalJobs      int `json:"totalJobs"`
  TotalUsers     int `json:"totalUsers"`
  ActivatedUsers int `json:"activatedUsers"`
  TotalRevenue   int `json:"totalRevenue"`
}

type loginRequest struct {
  Username string `json:"username"`
  Password string `json:"password"`
}

type createJobRequest struct {
  Title       string `json:"title"`
  Category    string `json:"category"`
  Pay         int    `json:"pay"`
  Pages       int    `json:"pages"`
  Deadline    string `json:"deadline"`
  Description string `json:"description"`
}

type activateRequest struct {
  Email string `json:"email"`
}

type genericResponse struct {
  Message string `json:"message"`
}

func main() {
  rand.Seed(time.Now().UnixNano())

  http.HandleFunc("/api/jobs", handleJobs)
  http.HandleFunc("/api/activate", handleActivate)
  http.HandleFunc("/api/admin/login", handleAdminLogin)
  http.HandleFunc("/api/admin/dashboard", withAdminAuth(handleAdminDashboard))
  http.HandleFunc("/api/admin/members", withAdminAuth(handleAdminMembers))
  http.HandleFunc("/api/admin/jobs", withAdminAuth(handleAdminCreateJob))

  log.Println("Go API running at http://localhost:8080")
  if err := http.ListenAndServe(":8080", nil); err != nil {
    log.Fatal(err)
  }
}

func withAdminAuth(handler http.HandlerFunc) http.HandlerFunc {
  return func(w http.ResponseWriter, r *http.Request) {
    setCors(w)
    if r.Method == http.MethodOptions {
      return
    }

    token := r.Header.Get("x-admin-token")
    if token != adminToken {
      writeJSON(w, http.StatusUnauthorized, genericResponse{Message: "Unauthorized"})
      return
    }
    handler(w, r)
  }
}

func handleJobs(w http.ResponseWriter, r *http.Request) {
  setCors(w)
  if r.Method != http.MethodGet {
    w.WriteHeader(http.StatusMethodNotAllowed)
    return
  }

  mu.Lock()
  payload := struct {
    Jobs []Job `json:"jobs"`
  }{Jobs: jobs}
  mu.Unlock()

  writeJSON(w, http.StatusOK, payload)
}

func handleActivate(w http.ResponseWriter, r *http.Request) {
  setCors(w)
  if r.Method != http.MethodPost {
    w.WriteHeader(http.StatusMethodNotAllowed)
    return
  }

  var request activateRequest
  if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
    writeJSON(w, http.StatusBadRequest, genericResponse{Message: "Invalid request payload."})
    return
  }

  if request.Email == "" {
    writeJSON(w, http.StatusBadRequest, genericResponse{Message: "Email is required."})
    return
  }

  mu.Lock()
  defer mu.Unlock()

  for i := range members {
    if members[i].Email == request.Email {
      members[i].Activated = true
      writeJSON(w, http.StatusOK, genericResponse{Message: "Account activated successfully."})
      return
    }
  }

  newMember := Member{
    ID:        randomID("user"),
    Email:     request.Email,
    Activated: true,
  }
  members = append(members, newMember)

  writeJSON(w, http.StatusOK, genericResponse{Message: "Account activated successfully."})
}

func handleAdminLogin(w http.ResponseWriter, r *http.Request) {
  setCors(w)
  if r.Method != http.MethodPost {
    w.WriteHeader(http.StatusMethodNotAllowed)
    return
  }

  var request loginRequest
  if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
    writeJSON(w, http.StatusBadRequest, genericResponse{Message: "Invalid request payload."})
    return
  }

  if request.Username == "admin@grandsky.local" && request.Password == "secret123" {
    writeJSON(w, http.StatusOK, struct {
      Token string `json:"token"`
    }{Token: adminToken})
    return
  }

  writeJSON(w, http.StatusUnauthorized, genericResponse{Message: "Invalid credentials."})
}

func handleAdminDashboard(w http.ResponseWriter, r *http.Request) {
  if r.Method != http.MethodGet {
    w.WriteHeader(http.StatusMethodNotAllowed)
    return
  }

  mu.Lock()
  defer mu.Unlock()

  revenue := 0
  activatedCount := 0
  for _, member := range members {
    if member.Activated {
      revenue += 500
      activatedCount++
    }
  }

  writeJSON(w, http.StatusOK, dashboardResponse{
    TotalJobs:      len(jobs),
    TotalUsers:     len(members),
    ActivatedUsers: activatedCount,
    TotalRevenue:   revenue,
  })
}

func handleAdminMembers(w http.ResponseWriter, r *http.Request) {
  if r.Method != http.MethodGet {
    w.WriteHeader(http.StatusMethodNotAllowed)
    return
  }

  mu.Lock()
  payload := struct {
    Members []Member `json:"members"`
  }{Members: members}
  mu.Unlock()

  writeJSON(w, http.StatusOK, payload)
}

func handleAdminCreateJob(w http.ResponseWriter, r *http.Request) {
  if r.Method != http.MethodPost {
    w.WriteHeader(http.StatusMethodNotAllowed)
    return
  }

  var request createJobRequest
  if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
    writeJSON(w, http.StatusBadRequest, genericResponse{Message: "Invalid request payload."})
    return
  }

  if request.Title == "" || request.Category == "" || request.Description == "" {
    writeJSON(w, http.StatusBadRequest, genericResponse{Message: "Title, category, and description are required."})
    return
  }

  mu.Lock()
  jobs = append(jobs, Job{
    ID:          randomID("job"),
    Title:       request.Title,
    Category:    request.Category,
    Pay:         request.Pay,
    Pages:       request.Pages,
    Deadline:    request.Deadline,
    Description: request.Description,
  })
  mu.Unlock()

  writeJSON(w, http.StatusCreated, genericResponse{Message: "Job successfully created."})
}

func setCors(w http.ResponseWriter) {
  w.Header().Set("Access-Control-Allow-Origin", "*")
  w.Header().Set("Access-Control-Allow-Headers", "Content-Type, x-admin-token")
  w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
  w.Header().Set("Content-Type", "application/json")
}

func writeJSON(w http.ResponseWriter, status int, value interface{}) {
  w.WriteHeader(status)
  if err := json.NewEncoder(w).Encode(value); err != nil {
    log.Println("failed to write JSON response:", err)
  }
}

func randomID(prefix string) string {
  return prefix + "-" + time.Now().Format("20060102150405") + "-" + randomString(4)
}

func randomString(length int) string {
  const letters = "abcdefghijklmnopqrstuvwxyz0123456789"
  result := make([]byte, length)
  for i := 0; i < length; i++ {
    result[i] = letters[rand.Intn(len(letters))]
  }
  return string(result)
}
