import { useCallback, useState } from "react";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void;
  acceptedFormats: string[];
  title: string;
  description: string;
  icon?: React.ReactNode;
}

const FileUploadZone = ({ 
  onFileSelect, 
  acceptedFormats, 
  title, 
  description,
  icon = <FileText className="w-12 h-12 text-technical-muted" />
}: FileUploadZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (!file) return;
    
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedFormats.includes(fileExtension)) {
      toast({
        title: "Invalid file format",
        description: `Please select a file with one of these formats: ${acceptedFormats.join(', ')}`,
        variant: "destructive",
      });
      return;
    }
    
    onFileSelect(file);
  }, [onFileSelect, acceptedFormats, toast]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  return (
    <Card className={`p-8 border-2 border-dashed transition-all duration-200 ${
      isDragging 
        ? 'border-technical bg-technical/5' 
        : 'border-border hover:border-technical/50'
    }`}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="text-center space-y-4"
      >
        <div className="flex justify-center">
          {icon}
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </div>

        <div className="space-y-4">
          <div className="flex justify-center">
            <Button
              variant="outline"
              className="relative overflow-hidden"
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose File
              <input
                type="file"
                accept={acceptedFormats.join(',')}
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </Button>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
            <AlertCircle className="w-4 h-4" />
            Supported formats: {acceptedFormats.join(', ')}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default FileUploadZone;