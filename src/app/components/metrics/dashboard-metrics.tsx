"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, Mail, FileText, Tag, Activity } from "lucide-react";
import {
  BlogActivityChart,
  CategoryUsageChart,
  UserRolesChart,
} from "./charts/dashboard-charts";

export function DashboardMetrics() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch("/api/metrics/dashboard");
        const data = await response.json();
        if (data.success) {
          setMetrics(data.data);
        }
      } catch (error) {
        console.error("Error fetching metrics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return <div>Loading metrics...</div>;
  }

  if (!metrics) {
    return <div>Failed to load metrics</div>;
  }

  return (
    <div className="grid gap-4">
      {/* User Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.userMetrics.totalUsers}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.userMetrics.newUsers30Days} new in last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.userMetrics.activeUsers}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.userMetrics.activationRate.toFixed(1)}% activation rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Blogs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.contentMetrics.totalBlogs}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.contentMetrics.newBlogs30Days} new in last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.contentMetrics.totalCategories}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.contentMetrics.averageBlogsPerUser.toFixed(1)} avg blogs
              per user
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Invitation Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Invitation Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm font-medium">Total Invitations</p>
              <p className="text-2xl font-bold">
                {metrics.invitationMetrics.totalInvitations}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Accepted Invitations</p>
              <p className="text-2xl font-bold">
                {metrics.invitationMetrics.acceptedInvitations}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Acceptance Rate</p>
              <p className="text-2xl font-bold">
                {metrics.invitationMetrics.acceptanceRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>System Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <p className="text-sm font-medium">Recent Signups (7d)</p>
              <p className="text-2xl font-bold">
                {metrics.systemMetrics.recentSignups}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Users w/o Profile Pic</p>
              <p className="text-2xl font-bold">
                {metrics.systemMetrics.usersWithoutProfilePic}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Deleted Users</p>
              <p className="text-2xl font-bold">
                {metrics.systemMetrics.deletedUsers}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Deleted Blogs</p>
              <p className="text-2xl font-bold">
                {metrics.systemMetrics.deletedBlogs}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-4">
        <UserRolesChart data={metrics.userMetrics.usersByRole} />
        <BlogActivityChart data={metrics.contentMetrics.blogActivity} />
        <CategoryUsageChart data={metrics.contentMetrics.categoriesUsage} />
      </div>
    </div>
  );
}
