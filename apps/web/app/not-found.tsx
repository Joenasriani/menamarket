import { Button, PageHeader } from "@menamarket/ui";

export default function NotFound() {
  return (
    <div className="section stack" style={{textAlign: "center", paddingTop: 80}}>
      <PageHeader title="Page not found" description="The page you are looking for does not exist or has been moved." />
      <div className="pill-row" style={{justifyContent: "center"}}>
        <Button href="/">Go home</Button>
        <Button href="/markets" variant="secondary">Browse markets</Button>
      </div>
    </div>
  );
}
