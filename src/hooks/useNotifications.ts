import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { firebaseService } from "@/integrations/firebase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: string;
  related_entity_type: string | null;
  related_entity_id: string | null;
  is_read: boolean;
  created_at: string;
}

export function useNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      const { data, error } = await firebaseService
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!user?.id,
  });

  // Realtime subscription
  useEffect(() => {
    if (!user?.id) return;
    const channel = firebaseService
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["notifications", user.id] });
        }
      )
      .subscribe();

    return () => { firebaseService.removeChannel(channel); };
  }, [user?.id, queryClient]);

  const unreadCount = query.data?.filter((n) => !n.is_read).length ?? 0;

  return { ...query, unreadCount };
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await firebaseService
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      const { error } = await firebaseService
        .from("notifications")
        .update({ is_read: true })
        .eq("is_read", false);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
    },
  });
}
