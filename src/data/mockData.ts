export interface Project {
  id: string;
  name: string;
  url: string;
  clientName: string;
  status: string;
  lastUpdated: string;
  progress: number;
}

export interface Activity {
  id: string;
  type: string;
  projectName: string;
  user: string;
  timestamp: string;
}

export const mockProjects: Project[] = [
  {
    id: "1",
    name: "E-commerce Website Review",
    url: "https://example-ecommerce.com",
    clientName: "Acme Inc.",
    status: "active",
    lastUpdated: "2023-06-15",
    progress: 65,
  },
  {
    id: "2",
    name: "Portfolio Site Evaluation",
    url: "https://portfolio-example.com",
    clientName: "Jane Designer",
    status: "completed",
    lastUpdated: "2023-06-10",
    progress: 100,
  },
  {
    id: "3",
    name: "SaaS Platform Analysis",
    url: "https://saas-platform.com",
    clientName: "Tech Solutions LLC",
    status: "active",
    lastUpdated: "2023-06-18",
    progress: 30,
  },
  {
    id: "4",
    name: "Blog Redesign Review",
    url: "https://blog-example.com",
    clientName: "Content Creators Co.",
    status: "archived",
    lastUpdated: "2023-05-20",
    progress: 100,
  },
];

export const mockActivities: Activity[] = [
  {
    id: "1",
    type: "review_started",
    projectName: "E-commerce Website Review",
    user: "Alex Johnson",
    timestamp: "2 hours ago",
  },
  {
    id: "2",
    type: "annotation_added",
    projectName: "SaaS Platform Analysis",
    user: "Maria Garcia",
    timestamp: "5 hours ago",
  },
  {
    id: "3",
    type: "review_completed",
    projectName: "Portfolio Site Evaluation",
    user: "Sam Wilson",
    timestamp: "1 day ago",
  },
  {
    id: "4",
    type: "project_created",
    projectName: "Blog Redesign Review",
    user: "Taylor Smith",
    timestamp: "3 days ago",
  },
];
