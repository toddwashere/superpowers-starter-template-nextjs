"use client";

import { useState } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Calendar } from "@workspace/ui/components/calendar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@workspace/ui/components/carousel";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { toast } from "@workspace/ui/components/sonner";

const tableData = [
  { name: "Alice Johnson", status: "Active", role: "Admin", email: "alice@example.com" },
  { name: "Bob Smith", status: "Active", role: "Member", email: "bob@example.com" },
  { name: "Carol White", status: "Invited", role: "Member", email: "carol@example.com" },
  { name: "Dave Brown", status: "Active", role: "Viewer", email: "dave@example.com" },
  { name: "Eve Davis", status: "Inactive", role: "Member", email: "eve@example.com" },
];

export function SectionData() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Data &amp; Display</h2>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Table</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.map((row) => (
              <TableRow key={row.email}>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell>{row.role}</TableCell>
                <TableCell>{row.email}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Badge</h3>
        <div className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Avatar</h3>
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="shadcn" />
            <AvatarFallback>SC</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <Avatar className="size-8">
            <AvatarFallback>AB</AvatarFallback>
          </Avatar>
          <Avatar className="size-14">
            <AvatarFallback>XY</AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Calendar</h3>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Carousel</h3>
        <div className="mx-auto max-w-xs">
          <Carousel>
            <CarouselContent>
              {[1, 2, 3, 4].map((n) => (
                <CarouselItem key={n}>
                  <div className="flex aspect-square items-center justify-center rounded-lg bg-muted">
                    <span className="text-3xl font-semibold">{n}</span>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Toast</h3>
        <Button
          onClick={() =>
            toast("Event has been created", {
              description: "Sunday, May 8, 2026 at 4:00 PM",
            })
          }
        >
          Show Toast
        </Button>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Chart Colors</h3>
        <div className="flex items-end gap-2" style={{ height: "120px" }}>
          {[
            { color: "bg-chart-1", height: "80%" },
            { color: "bg-chart-2", height: "60%" },
            { color: "bg-chart-3", height: "90%" },
            { color: "bg-chart-4", height: "45%" },
            { color: "bg-chart-5", height: "70%" },
          ].map((bar, i) => (
            <div
              key={i}
              className={`w-10 rounded-t ${bar.color}`}
              style={{ height: bar.height }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
