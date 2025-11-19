import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BarChart2,
  FileText,
  TrendingUp,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Eye,
  MoreHorizontal,
  Search,
  Filter,
  Trash,
  ExternalLink
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Project } from "@/data/mockData";

interface MagnetReportsProps {
  projects: Project[];
  onViewReport?: (project: Project) => void;
  onDownload?: (project: Project) => void;
  onDelete?: (project: Project) => void;
  onCreateReport?: () => void;
}

const MagnetReports: React.FC<MagnetReportsProps> = ({ 
  projects = [], 
  onViewReport, 
  onDownload, 
  onDelete,
  onCreateReport
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Calculate stats based on real data
  const totalReports = projects.length;
  
  // Calculate average score (mock calculation since progress is the only number we have right now, 
  // but in a real app this would be the MAGNET score)
  const avgScore = projects.length > 0 
    ? Math.round(projects.reduce((acc, curr) => acc + (curr.progress || 0), 0) / projects.length) 
    : 0;
    
  const activeClients = new Set(projects.map(p => p.clientName)).size;
  
  // Mock critical issues count based on low scores (< 60)
  const criticalIssues = projects.filter(p => (p.progress || 0) < 60).length;

  const stats = [
    {
      title: "Total Reports",
      value: totalReports.toString(),
      change: "+12%", // This would need historical data to be real
      trend: "up",
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Avg. MAGNET Score",
      value: `${avgScore}%`,
      change: "+5.2%",
      trend: "up",
      icon: BarChart2,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      title: "Active Clients",
      value: activeClients.toString(),
      change: "+3",
      trend: "up",
      icon: Users,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      title: "Critical Issues",
      value: criticalIssues.toString(),
      change: criticalIssues > 5 ? "+2" : "-1",
      trend: criticalIssues > 5 ? "up" : "down",
      icon: TrendingUp,
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
  ];

  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.clientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const magnetScores = [
    { name: "Message", fullName: "Magnetic Captivation", score: avgScore, color: "bg-red-500" },
    { name: "Attraction", fullName: "Authentic Connection", score: avgScore, color: "bg-orange-500" },
    { name: "Goal", fullName: "GOLDEN Persuasion", score: avgScore, color: "bg-yellow-500" },
    { name: "Navigation", fullName: "Niche-Precision Design", score: avgScore, color: "bg-green-500" },
    { name: "Experience", fullName: "Elegant Experience", score: avgScore, color: "bg-blue-500" },
    { name: "Trust", fullName: "Targeted Dominance", score: avgScore, color: "bg-purple-500" },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 60) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-700 hover:bg-green-200 border-green-200";
      case "active":
      case "in review":
        return "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200";
      case "needs attention":
        return "bg-red-100 text-red-700 hover:bg-red-200 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#34386a]">Reports Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage and analyze your MAGNET framework evaluations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="bg-white">
            <Download className="mr-2 h-4 w-4" /> Export All
          </Button>
          <Button 
            className="bg-[#34386a] hover:bg-[#2a2e56]"
            onClick={onCreateReport}
          >
            <BarChart2 className="mr-2 h-4 w-4" /> New Report
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="border-none shadow-sm">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-2xl font-bold">{stat.value}</h3>
                  <span className={`text-xs font-medium flex items-center ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.trend === 'up' ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-full ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Recent Reports Table */}
        <Card className="lg:col-span-2 border-none shadow-md">
          <CardHeader className="px-6 py-4 border-b flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg text-[#34386a]">Recent Reports</CardTitle>
              <CardDescription>Latest project evaluations and their status.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search reports..."
                  className="pl-8 h-9 w-[200px] bg-gray-50 border-gray-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Filter className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow>
                  <TableHead className="w-[250px]">Project</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No reports found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProjects.map((project) => (
                    <TableRow key={project.id} className="hover:bg-gray-50/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center text-gray-400">
                            {/* Placeholder for project image since we don't have one in the Project type yet */}
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-medium text-[#34386a]">{project.name}</div>
                            <div className="text-xs text-muted-foreground">{project.clientName}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{project.lastUpdated}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${getScoreColor(project.progress)} font-bold`}>
                          {project.progress}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={`${getStatusBadge(project.status)} border-none`}>
                          {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-[#34386a]"
                            onClick={() => onViewReport && onViewReport(project)}
                            title="View Report"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-[#34386a]"
                            onClick={() => onDownload && onDownload(project)}
                            title="Download Report"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-[#34386a]">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => onViewReport && onViewReport(project)}>
                                <Eye className="mr-2 h-4 w-4" /> View Report
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onDownload && onDownload(project)}>
                                <Download className="mr-2 h-4 w-4" /> Download JSON
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => window.open(project.url, '_blank')}>
                                <ExternalLink className="mr-2 h-4 w-4" /> Visit Website
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600 focus:text-red-600"
                                onClick={() => onDelete && onDelete(project)}
                              >
                                <Trash className="mr-2 h-4 w-4" /> Delete Project
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Aggregate Analysis */}
        <div className="space-y-8">
          <Card className="border-none shadow-md">
            <CardHeader className="px-6 py-4 border-b">
              <CardTitle className="text-lg text-[#34386a]">Performance Overview</CardTitle>
              <CardDescription>Average scores across all projects.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {magnetScores.map((item) => (
                  <div key={item.name} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${item.color}`} />
                        <span className="font-medium text-gray-700">{item.name}</span>
                      </div>
                      <span className="font-bold text-gray-900">{item.score}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.color}`}
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground pl-4">{item.fullName}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 pt-6 border-t">
                <h4 className="text-sm font-semibold text-[#34386a] mb-3">Insights</h4>
                {projects.length > 0 ? (
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-xs text-gray-600">
                    <span className="font-bold block mb-1">Data Collection in Progress</span>
                    Detailed category insights will appear here as more data is collected.
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-xs text-gray-600">
                    No data available for insights.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MagnetReports;
