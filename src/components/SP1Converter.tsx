import { useState } from "react";
import { FileDown, FileUp, Database, Map } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import FileUploadZone from "./FileUploadZone";
import ConversionStatus from "./ConversionStatus";
import { 
  parseSP1File, 
  generateSP1Content, 
  convertToGeoJSON, 
  convertToCSV, 
  parseCSVToSP1,
  SP1Data 
} from "@/utils/sp1Parser";

const SP1Converter = () => {
  const [importStatus, setImportStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [exportStatus, setExportStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [convertedData, setConvertedData] = useState<any>(null);
  const [fileName, setFileName] = useState<string>('');
  const [outputFormat, setOutputFormat] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { toast } = useToast();

  const handleSP1Import = async (file: File) => {
    setImportStatus('processing');
    setFileName(file.name);
    
    try {
      const content = await file.text();
      const sp1Data = parseSP1File(content);
      
      // Convert to GeoJSON by default for import
      const geoJsonData = convertToGeoJSON(sp1Data);
      setConvertedData(geoJsonData);
      setOutputFormat('GeoJSON');
      setImportStatus('success');
      
      toast({
        title: "Import successful",
        description: `Imported ${sp1Data.points.length} points from SP1 file`,
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
      setImportStatus('error');
      toast({
        title: "Import failed",
        description: "Failed to parse SP1 file. Please check the file format.",
        variant: "destructive",
      });
    }
  };

  const handleCSVExport = async (file: File) => {
    setExportStatus('processing');
    setFileName(file.name.replace(/\.[^/.]+$/, ".sp1"));
    
    try {
      const content = await file.text();
      const sp1Data = parseCSVToSP1(content, {
        version: "1.0",
        survey: "Converted from CSV",
        datum: "WGS84"
      });
      
      const sp1Content = generateSP1Content(sp1Data);
      setConvertedData(sp1Content);
      setOutputFormat('SP1');
      setExportStatus('success');
      
      toast({
        title: "Export successful",
        description: `Converted ${sp1Data.points.length} points to SP1 format`,
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
      setExportStatus('error');
      toast({
        title: "Export failed",
        description: "Failed to convert CSV file. Please check the format.",
        variant: "destructive",
      });
    }
  };

  const downloadFile = (data: any, filename: string, mimeType: string) => {
    const content = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportDownload = () => {
    if (!convertedData) return;
    const extension = outputFormat === 'GeoJSON' ? 'geojson' : 'csv';
    const mimeType = outputFormat === 'GeoJSON' ? 'application/geo+json' : 'text/csv';
    downloadFile(convertedData, `converted.${extension}`, mimeType);
  };

  const handleExportDownload = () => {
    if (!convertedData) return;
    downloadFile(convertedData, fileName, 'text/plain');
  };

  return (
    <div className="space-y-8">
      <Tabs defaultValue="import" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="import" className="flex items-center gap-2">
            <FileUp className="w-4 h-4" />
            Import SP1
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center gap-2">
            <FileDown className="w-4 h-4" />
            Export to SP1
          </TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-technical" />
                Import SP1 File
              </CardTitle>
              <CardDescription>
                Convert SP1 files to GeoJSON or CSV format for use in GIS applications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FileUploadZone
                onFileSelect={handleSP1Import}
                acceptedFormats={['.sp1', '.txt']}
                title="Select SP1 File"
                description="Drag and drop your SP1 file here or click to browse"
                icon={<Database className="w-12 h-12 text-technical-muted" />}
              />
              
              <ConversionStatus
                status={importStatus}
                fileName={fileName}
                outputFormat={outputFormat}
                onDownload={handleImportDownload}
                errorMessage={errorMessage}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="w-5 h-5 text-technical" />
                Export to SP1
              </CardTitle>
              <CardDescription>
                Convert CSV point data to SEG standard SP1 format
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FileUploadZone
                onFileSelect={handleCSVExport}
                acceptedFormats={['.csv']}
                title="Select CSV File"
                description="CSV must contain ID, X, Y columns (Elevation optional)"
                icon={<Map className="w-12 h-12 text-technical-muted" />}
              />
              
              <ConversionStatus
                status={exportStatus}
                fileName={fileName}
                outputFormat={outputFormat}
                onDownload={handleExportDownload}
                errorMessage={errorMessage}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Format Information */}
      <Card>
        <CardHeader>
          <CardTitle>SP1 Format Information</CardTitle>
          <CardDescription>
            SEG (Society of Exploration Geophysicists) SP1 standard format specifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Import (SP1 → GIS)</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Reads SP1/TXT files</li>
                <li>• Extracts coordinate data</li>
                <li>• Preserves elevation data</li>
                <li>• Outputs GeoJSON or CSV</li>
                <li>• Maintains attribute data</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Export (CSV → SP1)</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Requires ID, X, Y columns</li>
                <li>• Optional elevation column</li>
                <li>• Follows SEG SP1 standard</li>
                <li>• Includes header information</li>
                <li>• Tab-delimited output</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SP1Converter;