import { CheckCircle, Download, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ConversionStatusProps {
  status: 'idle' | 'processing' | 'success' | 'error';
  fileName?: string;
  outputFormat?: string;
  onDownload?: () => void;
  errorMessage?: string;
}

const ConversionStatus = ({ 
  status, 
  fileName, 
  outputFormat, 
  onDownload, 
  errorMessage 
}: ConversionStatusProps) => {
  if (status === 'idle') return null;

  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return <Loader2 className="w-6 h-6 text-technical animate-spin" />;
      case 'success':
        return <CheckCircle className="w-6 h-6 text-success" />;
      case 'error':
        return <AlertCircle className="w-6 h-6 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'processing':
        return `Converting ${fileName}...`;
      case 'success':
        return `Successfully converted to ${outputFormat} format`;
      case 'error':
        return errorMessage || 'Conversion failed';
      default:
        return '';
    }
  };

  const getCardClassName = () => {
    switch (status) {
      case 'success':
        return 'border-success/50 bg-success/5';
      case 'error':
        return 'border-destructive/50 bg-destructive/5';
      default:
        return 'border-technical/50 bg-technical/5';
    }
  };

  return (
    <Card className={`p-6 ${getCardClassName()}`}>
      <div className="flex items-center gap-4">
        {getStatusIcon()}
        <div className="flex-1">
          <p className="font-medium text-foreground">{getStatusMessage()}</p>
          {status === 'success' && fileName && (
            <p className="text-sm text-muted-foreground mt-1">
              File: {fileName}
            </p>
          )}
        </div>
        {status === 'success' && onDownload && (
          <Button onClick={onDownload} className="bg-success hover:bg-success/90">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        )}
      </div>
    </Card>
  );
};

export default ConversionStatus;