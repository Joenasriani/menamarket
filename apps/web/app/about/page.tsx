import { Card, PageHeader } from "@menamarket/ui";

export default function AboutPage() {
  return (
    <div className="section stack">
      <PageHeader eyebrow="About" title="Why MENAMarket starts with structure" description="Prediction-market products fail when visual polish arrives before governance, market standards, and settlement planning." />
      <div className="card-grid">
        <Card title="Original brand" eyebrow="Identity">MENAMarket uses its own naming, copy, structure, and visual system rather than imitating another platform.</Card>
        <Card title="Module-driven build" eyebrow="Execution">Each phase is designed to be narrow enough for reliable AI implementation and validation.</Card>
        <Card title="Truthful interface" eyebrow="Product policy">The shell shows only what is actually present at this stage and leaves future functionality visibly inactive.</Card>
      </div>
    </div>
  );
}
