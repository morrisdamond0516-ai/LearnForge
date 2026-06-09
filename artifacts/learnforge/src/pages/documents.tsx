import { useListDocuments, useCreateDocument, useDeleteDocument, useRequestUploadUrl, getListDocumentsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Loader2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { ObjectUploader } from "@workspace/object-storage-web";

export default function Documents() {
  const { data: documents, isLoading } = useListDocuments();
  const deleteDoc = useDeleteDocument();
  const createDoc = useCreateDocument();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const requestUrl = useRequestUploadUrl();

  const handleDelete = (id: number) => {
    deleteDoc.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Document deleted" });
        queryClient.invalidateQueries({ queryKey: getListDocumentsQueryKey() });
      }
    });
  };

  const handleUploadComplete = async (result: any) => {
    // result contains objectPath, metadata that we passed, etc.
    const fileData = result.successful[0];
    if (!fileData) return;

    try {
      await createDoc.mutateAsync({
        data: {
          name: fileData.meta.name,
          objectPath: fileData.response.body.objectPath || fileData.response.uploadURL, // objectPath from response
          contentType: fileData.type,
          size: fileData.size
        }
      });
      toast({ title: "Document uploaded successfully" });
      queryClient.invalidateQueries({ queryKey: getListDocumentsQueryKey() });
    } catch (e) {
      toast({ title: "Failed to register document", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Study Materials</h1>
          <p className="text-muted-foreground mt-1">Upload your PDFs and notes to generate study guides and quizzes.</p>
        </div>

        <ObjectUploader
          onGetUploadParameters={async (file) => {
            const res = await requestUrl.mutateAsync({
              data: {
                name: file.name,
                size: file.size ?? 0,
                contentType: file.type || "application/octet-stream",
              }
            });
            return {
              method: "PUT",
              url: res.uploadURL,
              headers: { "Content-Type": file.type || "application/octet-stream" },
            };
          }}
          onComplete={handleUploadComplete}
        >
          Upload Document
        </ObjectUploader>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents?.map((doc) => (
            <Card key={doc.id} className="hover-elevate transition-all duration-300">
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base truncate max-w-[180px]">{doc.name}</CardTitle>
                    <CardDescription>
                      {(doc.size && doc.size > 0) ? `${Math.round(doc.size / 1024)} KB` : 'Unknown size'} • {doc.status}
                    </CardDescription>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(doc.id)} className="text-muted-foreground hover:text-destructive">
                  {deleteDoc.isPending && deleteDoc.variables?.id === doc.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </Button>
              </CardHeader>
            </Card>
          ))}
          {documents?.length === 0 && (
            <div className="col-span-full py-16 text-center text-muted-foreground border border-dashed rounded-xl bg-muted/30">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No documents uploaded yet.</p>
              <p className="text-sm mt-1">Upload your class notes, textbooks, or research papers (PDF or text files). You can then turn them into quizzes and study guides built from your own material.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
