import Portfolio from "./Portfolio";

{
  /* Main content */
}
<div className="flex-1 overflow-y-auto">
  <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
  <div className="p-6">
    {activeTab === "portfolio" && <Portfolio />}
    {activeTab === "trading" && <Trading />}
    {activeTab === "news" && <News />}
    {activeTab === "tax" && <TaxCalculator />}
  </div>
</div>;
