"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle, XCircle, Info, AlertCircle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ErrorLog {
  id: string;
  message: string;
  stack?: string;
  level: "error" | "warn" | "info" | "debug";
  context?: string;
  url?: string;
  method?: string;
  statusCode?: number;
  occurrences: number;
  resolved: boolean;
  resolvedAt?: string;
  firstSeenAt: string;
  lastSeenAt: string;
  environment: string;
}

interface ErrorStats {
  total: number;
  unresolved: number;
  resolved: number;
  byLevel: {
    error: number;
    warn: number;
    info: number;
    debug: number;
  };
}

export default function ErrorsPage() {
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [stats, setStats] = useState<ErrorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unresolved" | "resolved">("unresolved");
  const [selectedError, setSelectedError] = useState<ErrorLog | null>(null);

  const fetchErrors = async () => {
    try {
      setLoading(true);
      const resolvedParam = filter === "all" ? "" : `&resolved=${filter === "resolved"}`;
      const response = await fetch(`/api/errors?limit=100${resolvedParam}`);
      const data = await response.json();
      setErrors(data.errors || []);
    } catch (error) {
      console.error("Failed to fetch errors:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/errors/stats?timeframe=day");
      const data = await response.json();
      setStats(data.stats);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  useEffect(() => {
    fetchErrors();
    fetchStats();
  }, [filter]);

  const handleResolve = async (errorId: string, resolved: boolean) => {
    try {
      await fetch(`/api/errors/${errorId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolved }),
      });
      fetchErrors();
      fetchStats();
      if (selectedError?.id === errorId) {
        setSelectedError(null);
      }
    } catch (error) {
      console.error("Failed to update error:", error);
    }
  };

  const handleDelete = async (errorId: string) => {
    if (!confirm("Are you sure you want to delete this error log?")) return;

    try {
      await fetch(`/api/errors/${errorId}`, {
        method: "DELETE",
      });
      fetchErrors();
      fetchStats();
      if (selectedError?.id === errorId) {
        setSelectedError(null);
      }
    } catch (error) {
      console.error("Failed to delete error:", error);
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "error":
        return <XCircle className="h-4 w-4 text-destructive" />;
      case "warn":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />;
      case "debug":
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "error":
        return "destructive";
      case "warn":
        return "warning";
      case "info":
        return "info";
      case "debug":
        return "secondary";
      default:
        return "default";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Error Monitoring</h1>
          <p className="text-muted-foreground mt-1">Track and manage application errors</p>
        </div>
        <Button onClick={() => { fetchErrors(); fetchStats(); }} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Errors (24h)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Unresolved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.unresolved}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Resolved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">By Level</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="destructive">E: {stats.byLevel.error}</Badge>
                <Badge variant="outline" className="border-yellow-500 text-yellow-600">W: {stats.byLevel.warn}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={filter} onValueChange={(value) => setFilter(value as any)}>
        <TabsList>
          <TabsTrigger value="unresolved">Unresolved</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6">
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="text-muted-foreground mt-4">Loading errors...</p>
            </div>
          ) : errors.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-semibold">No {filter} errors found</h3>
                <p className="text-muted-foreground mt-2">
                  {filter === "unresolved" ? "Great! Your application is running smoothly." : "No errors to display."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {errors.map((error) => (
                <Card key={error.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getLevelIcon(error.level)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <Badge variant={getLevelColor(error.level) as any}>{error.level}</Badge>
                            {error.context && <Badge variant="outline">{error.context}</Badge>}
                            {error.environment && <Badge variant="secondary">{error.environment}</Badge>}
                            {error.occurrences > 1 && (
                              <Badge variant="outline" className="bg-orange-50 border-orange-200 text-orange-700">
                                {error.occurrences}x
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-base font-medium break-words">{error.message}</CardTitle>
                          <CardDescription className="mt-1">
                            {error.url && <span className="block truncate">URL: {error.url}</span>}
                            <span className="block text-xs mt-1">
                              First seen: {new Date(error.firstSeenAt).toLocaleString()}
                              {error.lastSeenAt !== error.firstSeenAt &&
                                ` • Last seen: ${new Date(error.lastSeenAt).toLocaleString()}`
                              }
                            </span>
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedError(selectedError?.id === error.id ? null : error)}
                        >
                          {selectedError?.id === error.id ? "Hide" : "Details"}
                        </Button>
                        {!error.resolved ? (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleResolve(error.id, true)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Resolve
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResolve(error.id, false)}
                          >
                            Unresolve
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(error.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {selectedError?.id === error.id && error.stack && (
                    <CardContent>
                      <div className="rounded-lg bg-muted p-4">
                        <p className="text-sm font-medium mb-2">Stack Trace:</p>
                        <pre className="text-xs overflow-auto max-h-64 bg-background p-3 rounded border">
                          {error.stack}
                        </pre>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
