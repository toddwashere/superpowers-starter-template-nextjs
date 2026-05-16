"use client";

import { useMemo, useState, type ComponentProps, type ReactNode } from "react";
import { AnnotatedLayout, AnnotatedSection } from "@workspace/ui/components/annotated";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { ComboBox } from "@workspace/ui/components/combobox";
import { ComboBoxAutoComplete } from "@workspace/ui/components/combobox-autocomplete";
import { DataTable } from "@workspace/ui/components/data-table";
import { DataTableFilter } from "@workspace/ui/components/data-table-filter";
import { DataTablePagination } from "@workspace/ui/components/data-table-pagination";
import { DatePicker } from "@workspace/ui/components/date-picker";
import { DateRangePicker } from "@workspace/ui/components/date-range-picker";
import { EditButton } from "@workspace/ui/components/edit-button";
import { EmptyState } from "@workspace/ui/components/empty-state";
import { EmptyText } from "@workspace/ui/components/empty-text";
import {
  IconForAdd,
  IconForBilling,
  IconForDashboard,
  IconForEmail,
  IconForSettings,
} from "@workspace/ui/components/icon-for";
import { ImageDropzone } from "@workspace/ui/components/image-dropzone";
import { InfoButtonWithTooltip } from "@workspace/ui/components/info-button-with-tooltip";
import { InputCurrency } from "@workspace/ui/components/input-currency";
import { InputPassword } from "@workspace/ui/components/input-password";
import { InputSearch } from "@workspace/ui/components/input-search";
import { InputWithAdornments } from "@workspace/ui/components/input-with-adornments";
import {
  Page,
  PageActions,
  PageBody,
  PageHeader,
  PagePrimaryBar,
  PageTitle,
} from "@workspace/ui/components/page";
import { RadioCardItem, RadioCards } from "@workspace/ui/components/radio-cards";
import { Spinner } from "@workspace/ui/components/spinner";
import { TabsWithContent } from "@workspace/ui/components/tabs-with-content";
import { TagInput, type TagType } from "@workspace/ui/components/tag-input";
import { ThemeSwitcher } from "@workspace/ui/components/theme-switcher";
import { TooltipProvider } from "@workspace/ui/components/tooltip";

type DemoOption = {
  id: string;
  label: string;
  description: string;
};

type DateRangeValue = ComponentProps<typeof DateRangePicker>["dateRange"];

const demoOptions: DemoOption[] = [
  { id: "growth", label: "Growth", description: "User acquisition and activation" },
  { id: "retention", label: "Retention", description: "Engagement and lifecycle" },
  { id: "billing", label: "Billing", description: "Plans, invoices, and payments" },
];

const getOptionId = (option: DemoOption) => option.id;
const getOptionText = (option: DemoOption) => option.label;
const getOptionFilterText = (option: DemoOption) => [
  option.label,
  option.description,
];

const renderOption = (option: DemoOption) => (
  <div className="flex flex-col">
    <span>{option.label}</span>
    <span className="text-xs text-muted-foreground">{option.description}</span>
  </div>
);

const statusFilterOptions = [
  { label: "Active", value: "active", count: 2 },
  { label: "Invited", value: "invited", count: 1 },
  { label: "Paused", value: "paused", count: 1 },
];

type DemoRow = {
  name: string;
  owner: string;
  status: "active" | "invited" | "paused";
  monthlySpend: number;
};

const demoRows: DemoRow[] = [
  { name: "Alpha Workspace", owner: "Avery", status: "active", monthlySpend: 280 },
  { name: "Beacon CRM", owner: "Blair", status: "active", monthlySpend: 160 },
  { name: "Circuit Labs", owner: "Casey", status: "invited", monthlySpend: 90 },
  { name: "Delta Ops", owner: "Devon", status: "paused", monthlySpend: 45 },
];

const demoColumnKeys = ["name", "owner", "status", "monthlySpend"] as const;

type DemoColumnKey = (typeof demoColumnKeys)[number];

const demoColumnLabels: Record<DemoColumnKey, string> = {
  name: "Workspace",
  owner: "Owner",
  status: "Status",
  monthlySpend: "Spend",
};

type LocalCell = {
  id: string;
  column: {
    columnDef: {
      cell: ReactNode;
    };
  };
  getContext: () => Record<string, never>;
};

type LocalRow = {
  id: string;
  getIsSelected: () => boolean;
  getIsExpanded: () => boolean;
  getVisibleCells: () => LocalCell[];
};

type LocalTable = {
  getHeaderGroups: () => {
    id: string;
    headers: {
      id: string;
      colSpan: number;
      isPlaceholder: boolean;
      column: {
        columnDef: {
          header: string;
        };
      };
      getContext: () => Record<string, never>;
    }[];
  }[];
  getRowModel: () => { rows: LocalRow[] };
  getFilteredRowModel: () => { rows: LocalRow[] };
  getVisibleLeafColumns: () => { id: string }[];
  getPageCount: () => number;
  getState: () => { pagination: { pageIndex: number; pageSize: number } };
  setPageSize: (pageSize: number) => void;
  getRowCount: () => number;
  setPageIndex: (pageIndex: number) => void;
  getCanPreviousPage: () => boolean;
  previousPage: () => void;
  getCanNextPage: () => boolean;
  nextPage: () => void;
};

function createLocalRow(row: DemoRow): LocalRow {
  const cellContent: Record<DemoColumnKey, ReactNode> = {
    name: <span className="font-medium">{row.name}</span>,
    owner: row.owner,
    status: (
      <Badge variant={row.status === "paused" ? "outline" : "secondary"}>
        {row.status}
      </Badge>
    ),
    monthlySpend: `$${row.monthlySpend.toLocaleString()}`,
  };

  return {
    id: row.name,
    getIsSelected: () => false,
    getIsExpanded: () => false,
    getVisibleCells: () =>
      demoColumnKeys.map((columnKey) => ({
        id: `${row.name}-${columnKey}`,
        column: {
          columnDef: {
            cell: cellContent[columnKey],
          },
        },
        getContext: () => ({}),
      })),
  };
}

function useDemoTable(statusFilter: string[]) {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 2 });
  const data = useMemo(() => {
    if (statusFilter.length === 0) {
      return demoRows;
    }

    return demoRows.filter((row) => statusFilter.includes(row.status));
  }, [statusFilter]);
  const pageCount = Math.max(1, Math.ceil(data.length / pagination.pageSize));
  const safePageIndex = Math.min(pagination.pageIndex, pageCount - 1);
  const pagedData = data.slice(
    safePageIndex * pagination.pageSize,
    safePageIndex * pagination.pageSize + pagination.pageSize
  );
  const filteredRows = data.map(createLocalRow);
  const pageRows = pagedData.map(createLocalRow);

  return {
    getHeaderGroups: () => [
      {
        id: "demo-headers",
        headers: demoColumnKeys.map((columnKey) => ({
          id: columnKey,
          colSpan: 1,
          isPlaceholder: false,
          column: {
            columnDef: {
              header: demoColumnLabels[columnKey],
            },
          },
          getContext: () => ({}),
        })),
      },
    ],
    getRowModel: () => ({ rows: pageRows }),
    getFilteredRowModel: () => ({ rows: filteredRows }),
    getVisibleLeafColumns: () =>
      demoColumnKeys.map((columnKey) => ({ id: columnKey })),
    getPageCount: () => pageCount,
    getState: () => ({
      pagination: {
        pageIndex: safePageIndex,
        pageSize: pagination.pageSize,
      },
    }),
    setPageSize: (pageSize: number) =>
      setPagination({ pageIndex: 0, pageSize }),
    getRowCount: () => data.length,
    setPageIndex: (pageIndex: number) =>
      setPagination((current) => ({
        ...current,
        pageIndex: Math.max(0, Math.min(pageIndex, pageCount - 1)),
      })),
    getCanPreviousPage: () => safePageIndex > 0,
    previousPage: () =>
      setPagination((current) => ({
        ...current,
        pageIndex: Math.max(0, current.pageIndex - 1),
      })),
    getCanNextPage: () => safePageIndex < pageCount - 1,
    nextPage: () =>
      setPagination((current) => ({
        ...current,
        pageIndex: Math.min(pageCount - 1, current.pageIndex + 1),
      })),
  } satisfies LocalTable;
}

export function SectionExtendedComponents() {
  const [searchValue, setSearchValue] = useState("design");
  const [comboBoxValue, setComboBoxValue] = useState<DemoOption | null>(
    demoOptions[0] ?? null
  );
  const [autoCompleteValue, setAutoCompleteValue] = useState<DemoOption | null>(
    demoOptions[1] ?? null
  );
  const [date, setDate] = useState<Date | undefined>(new Date(2026, 4, 15));
  const [dateRange, setDateRange] = useState<DateRangeValue>({
    from: new Date(2026, 4, 11),
    to: new Date(2026, 4, 15),
  });
  const [tags, setTags] = useState<TagType[]>([
    { id: "tag-design-0", text: "design" },
    { id: "tag-release-1", text: "release" },
  ]);
  const [dropzoneMessage, setDropzoneMessage] = useState(
    "Drag a mock image here or click to select one."
  );
  const [statusFilter, setStatusFilter] = useState<string[]>(["active"]);
  const [radioValue, setRadioValue] = useState("pro");
  const table = useDemoTable(statusFilter);

  return (
    <TooltipProvider>
      <div className="space-y-8">
        <h2 className="text-2xl font-bold">Extended Components</h2>

      <AnnotatedLayout className="rounded-lg border" spacing="small">
        <AnnotatedSection
          title="Annotated"
          description="Use annotated sections to pair compact guidance with an interactive control."
          contentClassName="space-y-3"
        >
          <InputWithAdornments
            startAdornment={<IconForEmail className="size-4" />}
            endAdornment={<Badge variant="secondary">Verified</Badge>}
            defaultValue="admin@example.com"
            aria-label="Email with adornments"
          />
          <EmptyText>EmptyText keeps low-emphasis copy consistent.</EmptyText>
        </AnnotatedSection>
      </AnnotatedLayout>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Inputs</h3>
          <InputSearch
            value={searchValue}
            onValueChange={setSearchValue}
            placeholder="Search components"
            alwaysShowClearButton
          />
          <InputPassword placeholder="Password" defaultValue="super-secret" />
          <InputCurrency
            aria-label="Monthly budget"
            defaultValue={199}
            currency="$"
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Comboboxes</h3>
          <ComboBox
            value={comboBoxValue}
            onChange={setComboBoxValue}
            options={demoOptions}
            getDisplayText={getOptionText}
            getFilterText={getOptionFilterText}
            getItemId={getOptionId}
            renderItem={renderOption}
            placeholder="Select a focus area"
            showClearButton
          />
          <ComboBoxAutoComplete
            value={autoCompleteValue}
            onChange={setAutoCompleteValue}
            options={demoOptions}
            getDisplayText={getOptionText}
            getFilterText={getOptionFilterText}
            getItemId={getOptionId}
            renderItem={renderOption}
            placeholder="Choose a workflow"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Date Pickers</h3>
          <div className="flex flex-wrap gap-3">
            <DatePicker date={date} onDateChange={setDate} />
            <DateRangePicker
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Tags</h3>
          <TagInput
            tags={tags}
            onTagsChange={setTags}
            placeholder="Add a tag and press Enter"
            maxTags={5}
            clearAll
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Image Dropzone</h3>
        <ImageDropzone
          title="Upload preview image"
          subtitle={dropzoneMessage}
          accept={{ "image/*": [] }}
          onDrop={(files) =>
            setDropzoneMessage(`${files.length} file selected for preview.`)
          }
          onError={(error) => setDropzoneMessage(error.message)}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Data Table</h3>
        <div className="space-y-3 rounded-lg border">
          <div className="flex flex-wrap items-center gap-3 p-3">
            <DataTableFilter
              title="Status"
              selected={statusFilter}
              onChange={setStatusFilter}
              options={statusFilterOptions}
            />
            <EmptyText>{table.getFilteredRowModel().rows.length} rows shown.</EmptyText>
          </div>
          <DataTable table={table as never} />
          <DataTablePagination table={table as never} pageSizeOptions={[2, 4]} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <EmptyState
          title="No reports yet"
          description="Create a report to populate this workspace."
          icon={<IconForDashboard className="size-10 text-muted-foreground" />}
          className="min-h-56 border"
        >
          <Button size="sm">
            <IconForAdd />
            Create report
          </Button>
        </EmptyState>

        <Page className="h-56 rounded-lg border">
          <PageHeader>
            <PagePrimaryBar>
              <PageTitle>Preview Page</PageTitle>
              <PageActions>
                <EditButton size="sm">Edit</EditButton>
              </PageActions>
            </PagePrimaryBar>
          </PageHeader>
          <PageBody>
            <div className="p-4">
              <EmptyText>No activity has been recorded yet.</EmptyText>
            </div>
          </PageBody>
        </Page>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Radio Cards</h3>
        <RadioCards
          value={radioValue}
          onValueChange={setRadioValue}
          className="grid gap-3 md:grid-cols-3"
        >
          <RadioCardItem value="starter">
            <span className="block font-medium">Starter</span>
            <span className="text-sm text-muted-foreground">Small teams</span>
          </RadioCardItem>
          <RadioCardItem value="pro">
            <span className="block font-medium">Pro</span>
            <span className="text-sm text-muted-foreground">Growing teams</span>
          </RadioCardItem>
          <RadioCardItem value="enterprise">
            <span className="block font-medium">Enterprise</span>
            <span className="text-sm text-muted-foreground">Custom needs</span>
          </RadioCardItem>
        </RadioCards>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Tabs With Content</h3>
        <div className="h-52 rounded-lg border">
          <TabsWithContent
            tabs={[
              {
                tabId: "overview",
                label: "Overview",
                icon: IconForDashboard,
                content: (
                  <div className="space-y-2 p-4">
                    <p className="font-medium">Overview content</p>
                    <EmptyText>Compact content can live inside each tab.</EmptyText>
                  </div>
                ),
              },
              {
                tabId: "billing",
                label: "Billing",
                icon: IconForBilling,
                content: (
                  <div className="space-y-2 p-4">
                    <p className="font-medium">Billing content</p>
                    <EmptyText>Use icons from the shared icon registry.</EmptyText>
                  </div>
                ),
              },
              {
                tabId: "settings",
                label: "Settings",
                icon: IconForSettings,
                content: (
                  <div className="space-y-2 p-4">
                    <p className="font-medium">Settings content</p>
                    <EmptyText>Panels remain deterministic and local.</EmptyText>
                  </div>
                ),
              },
            ]}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Spinner size="small">
          <span className="mt-2 text-xs text-muted-foreground">Loading</span>
        </Spinner>
        <InfoButtonWithTooltip content="Extended components are reusable UI helpers beyond the baseline set." />
        <ThemeSwitcher />
      </div>
      </div>
    </TooltipProvider>
  );
}
