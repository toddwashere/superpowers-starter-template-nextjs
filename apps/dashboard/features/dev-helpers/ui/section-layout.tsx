"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";
import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible";
import { Progress } from "@workspace/ui/components/progress";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@workspace/ui/components/resizable";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Separator } from "@workspace/ui/components/separator";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";

export function SectionLayout() {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Layout &amp; Feedback</h2>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Card</h3>
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Project Settings</CardTitle>
            <CardDescription>
              Manage your project configuration and preferences.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your project is currently on the Pro plan with 5 team members.
            </p>
          </CardContent>
          <CardFooter className="justify-end gap-2">
            <Button variant="outline">Cancel</Button>
            <Button>Save Changes</Button>
          </CardFooter>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Separator</h3>
        <Separator />
        <div className="flex h-5 items-center gap-4 text-sm">
          <span>Blog</span>
          <Separator orientation="vertical" />
          <span>Docs</span>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Tabs</h3>
        <Tabs defaultValue="account" className="max-w-md">
          <TabsList>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          <TabsContent value="account">
            <p className="text-sm text-muted-foreground">
              Make changes to your account here.
            </p>
          </TabsContent>
          <TabsContent value="password">
            <p className="text-sm text-muted-foreground">
              Change your password here.
            </p>
          </TabsContent>
          <TabsContent value="notifications">
            <p className="text-sm text-muted-foreground">
              Manage your notification preferences.
            </p>
          </TabsContent>
        </Tabs>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Accordion</h3>
        <Accordion type="single" collapsible className="max-w-md">
          <AccordionItem value="item-1">
            <AccordionTrigger>Is it accessible?</AccordionTrigger>
            <AccordionContent>
              Yes. It adheres to the WAI-ARIA design pattern.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Is it styled?</AccordionTrigger>
            <AccordionContent>
              Yes. It comes with default styles that match the other components.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Is it animated?</AccordionTrigger>
            <AccordionContent>
              Yes. It&apos;s animated by default, but you can disable it if you prefer.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Collapsible</h3>
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button variant="outline">Toggle content</Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <p className="text-sm text-muted-foreground">
              This content can be shown or hidden by clicking the button above.
            </p>
          </CollapsibleContent>
        </Collapsible>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Skeleton</h3>
        <div className="flex items-center gap-4">
          <Skeleton className="size-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
        <Skeleton className="h-[125px] w-[250px] rounded-xl" />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Alert</h3>
        <Alert>
          <AlertTitle>Heads up!</AlertTitle>
          <AlertDescription>
            You can customize this alert with different variants.
          </AlertDescription>
        </Alert>
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Something went wrong. Please try again.
          </AlertDescription>
        </Alert>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Progress</h3>
        <Progress value={60} />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Scroll Area</h3>
        <ScrollArea className="h-48 w-[250px] rounded-md border p-4">
          <div className="space-y-2">
            {Array.from({ length: 20 }, (_, i) => (
              <p key={i} className="text-sm">
                Item {i + 1}
              </p>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Resizable</h3>
        <ResizablePanelGroup
          orientation="horizontal"
          className="min-h-[200px] max-w-md rounded-lg border"
        >
          <ResizablePanel defaultSize={50}>
            <div className="flex h-full items-center justify-center p-6">
              <span className="font-semibold">Panel A</span>
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={50}>
            <div className="flex h-full items-center justify-center p-6">
              <span className="font-semibold">Panel B</span>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
