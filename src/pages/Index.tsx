import Header from "@/components/Header";
import SP1Converter from "@/components/SP1Converter";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 py-8">
        <SP1Converter />
      </main>
    </div>
  );
};

export default Index;
