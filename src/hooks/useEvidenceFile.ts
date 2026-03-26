import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useEvidenceFile() {
  const [loading, setLoading] = useState<string | null>(null);

  const getSignedUrl = useCallback(async (filePath: string): Promise<string | null> => {
    const { data, error } = await supabase.storage
      .from("evidence")
      .createSignedUrl(filePath, 3600);
    if (error) {
      toast.error("تعذر الوصول للملف: " + error.message);
      return null;
    }
    return data.signedUrl;
  }, []);

  const viewFile = useCallback(async (filePath: string) => {
    setLoading(filePath);
    const url = await getSignedUrl(filePath);
    if (url) window.open(url, "_blank");
    setLoading(null);
  }, [getSignedUrl]);

  const downloadFile = useCallback(async (filePath: string, fileName?: string) => {
    setLoading(filePath);
    const { data, error } = await supabase.storage
      .from("evidence")
      .download(filePath);
    if (error) {
      toast.error("تعذر تنزيل الملف: " + error.message);
      setLoading(null);
      return;
    }
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName || filePath.split("/").pop() || "file";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setLoading(null);
  }, []);

  return { viewFile, downloadFile, getSignedUrl, loading };
}
