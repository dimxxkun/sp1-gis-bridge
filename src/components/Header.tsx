import { FileText, Database } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-card border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-technical">
            <Database className="w-6 h-6" />
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">SP1 Converter</h1>
            <p className="text-sm text-muted-foreground">SEG Standard File Format Converter for GIS Workflows</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;