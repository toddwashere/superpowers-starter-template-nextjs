"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollAnchor } from "@workspace/ui/components/scroll-anchor";
import { Page } from "@workspace/ui/components/page";
import { ThemeToggle } from "@workspace/ui/components/theme-toggle";
import { PageHeaderNoOrg } from "@/common/ui/page-header-no-org";
import { SectionColors } from "./section-colors";
import { SectionTypography } from "./section-typography";
import { SectionIcons } from "./section-icons";
import { SectionSidebar } from "./section-sidebar";
import { SectionActions } from "./section-actions";
import { SectionLayout } from "./section-layout";
import { SectionOverlays } from "./section-overlays";
import { SectionData } from "./section-data";
import { SectionExtendedComponents } from "./section-extended-components";

const tocItems = [
  { id: "colors", label: "Colors & Tokens" },
  { id: "typography", label: "Typography" },
  { id: "icons", label: "Icons" },
  { id: "sidebar", label: "Sidebar" },
  { id: "actions", label: "Actions & Forms" },
  { id: "layout", label: "Layout & Feedback" },
  { id: "overlays", label: "Overlays & Nav" },
  { id: "data", label: "Data & Display" },
  { id: "extended-components", label: "Extended Components" },
] as const;

export function DevUiPageContent() {
  const [activeSection, setActiveSection] = useState<string>("colors");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          setActiveSection(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );

    for (const item of tocItems) {
      const el = document.getElementById(item.id);
      if (el) observerRef.current.observe(el);
    }

    return () => observerRef.current?.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <Page className="flex min-h-screen flex-col bg-background text-foreground">
      <PageHeaderNoOrg
        title="Design System"
        description="Preview and test shared UI components, tokens, and patterns."
        actions={<ThemeToggle />}
      />
      <div className="flex min-h-0 flex-1">
        <nav className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-52 shrink-0 overflow-y-auto border-r p-4 lg:block">
          <ul className="space-y-1">
            {tocItems.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => scrollTo(item.id)}
                  className={`w-full rounded-md px-3 py-1.5 text-left text-sm transition-colors ${
                    activeSection === item.id
                      ? "bg-accent font-medium text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                  }`}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <main className="min-w-0 flex-1 p-6 lg:p-10">
          <div className="mx-auto max-w-5xl space-y-16">
            <ScrollAnchor id="colors">
              <SectionColors />
            </ScrollAnchor>
            <ScrollAnchor id="typography">
              <SectionTypography />
            </ScrollAnchor>
            <ScrollAnchor id="icons">
              <SectionIcons />
            </ScrollAnchor>
            <ScrollAnchor id="sidebar">
              <SectionSidebar />
            </ScrollAnchor>
            <ScrollAnchor id="actions">
              <SectionActions />
            </ScrollAnchor>
            <ScrollAnchor id="layout">
              <SectionLayout />
            </ScrollAnchor>
            <ScrollAnchor id="overlays">
              <SectionOverlays />
            </ScrollAnchor>
            <ScrollAnchor id="data">
              <SectionData />
            </ScrollAnchor>
            <ScrollAnchor id="extended-components">
              <SectionExtendedComponents />
            </ScrollAnchor>
          </div>
        </main>
      </div>
    </Page>
  );
}
