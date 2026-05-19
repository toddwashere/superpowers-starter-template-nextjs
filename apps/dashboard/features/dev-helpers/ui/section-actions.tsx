"use client";

import { Button } from "@workspace/ui/components/button";
import {
  CopyToClipboardButton,
  CopyToClipboardField,
} from "@workspace/ui/components/copy-to-clipboard-button";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { Input } from "@workspace/ui/components/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@workspace/ui/components/input-otp";
import { Label } from "@workspace/ui/components/label";
import { RadioGroup, RadioGroupItem } from "@workspace/ui/components/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Slider } from "@workspace/ui/components/slider";
import { Switch } from "@workspace/ui/components/switch";
import { Textarea } from "@workspace/ui/components/textarea";
import { Toggle } from "@workspace/ui/components/toggle";
import { ToggleGroup, ToggleGroupItem } from "@workspace/ui/components/toggle-group";
import {
  IconForAdd,
  IconForBold,
  IconForItalic,
  IconForUnderline,
} from "@workspace/ui/components/icon-for";

export function SectionActions() {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Actions &amp; Form Controls</h2>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Button</h3>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="default">Default</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="xs">XS</Button>
          <Button size="sm">SM</Button>
          <Button size="default">Default</Button>
          <Button size="lg">LG</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="icon-xs"><IconForAdd /></Button>
          <Button size="icon-sm"><IconForAdd /></Button>
          <Button size="icon"><IconForAdd /></Button>
          <Button size="icon-lg"><IconForAdd /></Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button disabled>Default</Button>
          <Button variant="destructive" disabled>Destructive</Button>
          <Button variant="outline" disabled>Outline</Button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Input</h3>
        <div className="flex flex-wrap items-center gap-3">
          <Input placeholder="Email address" />
          <Input placeholder="Disabled" disabled />
        </div>
        <div className="space-y-2">
          <Label htmlFor="labeled-input">Email</Label>
          <Input id="labeled-input" placeholder="Email address" />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Copy to clipboard</h3>
        <div className="max-w-md space-y-4">
          <CopyToClipboardField text="https://example.com/api/mcp" />
          <CopyToClipboardButton
            text="Standalone label button"
            display="label"
            variant="outline"
            size="sm"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Textarea</h3>
        <Textarea placeholder="Type your message here..." />
        <Textarea placeholder="Disabled" disabled />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Select</h3>
        <Select>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select a fruit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="banana">Banana</SelectItem>
            <SelectItem value="cherry">Cherry</SelectItem>
            <SelectItem value="date">Date</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Checkbox</h3>
        <div className="flex items-center gap-2">
          <Checkbox id="terms" />
          <Label htmlFor="terms">Accept terms</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="checked" defaultChecked />
          <Label htmlFor="checked">Checked</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="disabled" disabled />
          <Label htmlFor="disabled">Disabled</Label>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Radio Group</h3>
        <RadioGroup defaultValue="option-b">
          <div className="flex items-center gap-2">
            <RadioGroupItem value="option-a" id="option-a" />
            <Label htmlFor="option-a">Option A</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="option-b" id="option-b" />
            <Label htmlFor="option-b">Option B</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="option-c" id="option-c" />
            <Label htmlFor="option-c">Option C</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Switch</h3>
        <div className="flex items-center gap-2">
          <Switch id="switch-off" />
          <Label htmlFor="switch-off">Off</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="switch-on" defaultChecked />
          <Label htmlFor="switch-on">On</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="switch-disabled" disabled />
          <Label htmlFor="switch-disabled">Disabled</Label>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Slider</h3>
        <Slider defaultValue={[50]} max={100} />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Toggle</h3>
        <div className="flex flex-wrap items-center gap-3">
          <Toggle aria-label="Toggle bold">
            <IconForBold />
          </Toggle>
          <Toggle aria-label="Toggle italic" defaultPressed>
            <IconForItalic />
          </Toggle>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Toggle Group</h3>
        <ToggleGroup type="single">
          <ToggleGroupItem value="bold" aria-label="Toggle bold">
            <IconForBold />
          </ToggleGroupItem>
          <ToggleGroupItem value="italic" aria-label="Toggle italic">
            <IconForItalic />
          </ToggleGroupItem>
          <ToggleGroupItem value="underline" aria-label="Toggle underline">
            <IconForUnderline />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Input OTP</h3>
        <InputOTP maxLength={6}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>
    </div>
  );
}
