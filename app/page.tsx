"use client"

import { useRef, useState } from "react"
import html2canvas from "html2canvas-pro"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const CURRENCIES = [
  { value: "USD", label: "USD - US Dollar" },
  { value: "CAD", label: "CAD - CANADIAN DOLLAR" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British Pound" },
  { value: "SGD", label: "SGD - Singapore Dollar" },
  { value: "THB", label: "THB - Thai Bhatt" },
  { value: "AED", label: "AED - DUBAI DIRHAM" },
  { value: "AUD", label: "AUD - AUSTRALIAN Dollar" },
  { value: "NZD", label: "NZD - NEWZEALAND Dollar" },
  { value: "JPY", label: "JPY - JAPANESSE YEN" },
  { value: "MYR", label: "MYR - MALAYSIAN RINGET" },
  { value: "HKD", label: "HKD - HONGKONG Dollar" },
  { value: "IDR", label: "IDR - INDONESIA RUPIAH" },
  { value: "CNY", label: "CNY - CHINESSE YUAN" },
  { value: "VND", label: "VND - VIETNAM DONG" },
]

type LineItem = { id: number; currency: string; amount: string; rate: string }

let nextId = 1
const newItem = (): LineItem => ({
  id: nextId++,
  currency: "",
  amount: "",
  rate: "",
})

export default function Page() {
  const [items, setItems] = useState<LineItem[]>([newItem()])
  const [transactionType, setTransactionType] = useState<"sale" | "purchase">(
    "sale"
  )
  const [addService, setAddService] = useState(false)
  const [serviceCharge, setServiceCharge] = useState("")
  const quotationRef = useRef<HTMLDivElement>(null)

  const updateItem = (id: number, patch: Partial<LineItem>) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)))
  const removeItem = (id: number) =>
    setItems((prev) => prev.filter((i) => i.id !== id))

  const rowInr = (i: LineItem) =>
    (parseFloat(i.amount) || 0) * (parseFloat(i.rate) || 0)
  const inr = items.reduce((sum, i) => sum + rowInr(i), 0)

  let gst: number
  if (inr <= 25_000) gst = 45
  else if (inr <= 100_000) gst = inr * 0.0018
  else if (inr <= 1_000_000) gst = (inr - 100_000) * 0.0009 + 180
  else gst = (inr - 1_000_000) * 0.00018 + 990
  gst = Math.round(gst)

  const isSale = transactionType === "sale"
  const sc = addService ? parseFloat(serviceCharge) || 0 : 0
  const scGst = sc * 0.18
  const final = isSale ? inr + gst + sc + scGst : inr - gst - sc - scGst

  const handleSave = async () => {
    if (!quotationRef.current) return
    const canvas = await html2canvas(quotationRef.current)
    const link = document.createElement("a")
    link.download = `quotation-${transactionType}-${new Date().toISOString().split("T")[0]}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  const cell = "border border-black p-2"

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4 rounded-lg border border-yellow-500 bg-black p-6">
            <h2 className="text-xl font-bold text-yellow-500">Enter Details</h2>

            <div className="space-y-2">
              <Label className="text-yellow-500">Transaction Type</Label>
              <RadioGroup
                value={transactionType}
                onValueChange={(v) => setTransactionType(v as "sale" | "purchase")}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="sale"
                    id="sale"
                    className="border-yellow-500 text-yellow-500"
                  />
                  <Label htmlFor="sale" className="text-yellow-500">
                    Sale
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="purchase"
                    id="purchase"
                    className="border-yellow-500 text-yellow-500"
                  />
                  <Label htmlFor="purchase" className="text-yellow-500">
                    Purchase
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {items.map((item, idx) => (
              <div
                key={item.id}
                className="space-y-3 rounded-md border border-yellow-500/50 p-3"
              >
                <div className="flex items-center justify-between">
                  <Label className="text-yellow-500">Currency {idx + 1}</Label>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-sm text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <Select
                  value={item.currency}
                  onValueChange={(v) => updateItem(item.id, { currency: v })}
                >
                  <SelectTrigger className="w-full bg-black text-yellow-500">
                    <SelectValue placeholder="Select Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-yellow-500">FX Amount</Label>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={item.amount}
                      onChange={(e) =>
                        updateItem(item.id, { amount: e.target.value })
                      }
                      className="bg-black text-yellow-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-yellow-500">Exchange Rate</Label>
                    <Input
                      type="number"
                      step="0.0001"
                      placeholder="Enter rate"
                      value={item.rate}
                      onChange={(e) =>
                        updateItem(item.id, { rate: e.target.value })
                      }
                      className="bg-black text-yellow-500"
                    />
                  </div>
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={() => setItems((prev) => [...prev, newItem()])}
              className="w-full border-yellow-500 bg-black text-yellow-500 hover:bg-yellow-500/10 hover:text-yellow-500"
            >
              + Add Another Currency
            </Button>

            <div className="space-y-2">
              <Label className="text-yellow-500">Add Service Charge?</Label>
              <RadioGroup
                value={addService ? "yes" : "no"}
                onValueChange={(v) => setAddService(v === "yes")}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="yes"
                    id="sc-yes"
                    className="border-yellow-500 text-yellow-500"
                  />
                  <Label htmlFor="sc-yes" className="text-yellow-500">
                    Yes
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="no"
                    id="sc-no"
                    className="border-yellow-500 text-yellow-500"
                  />
                  <Label htmlFor="sc-no" className="text-yellow-500">
                    No
                  </Label>
                </div>
              </RadioGroup>
              {addService && (
                <Input
                  type="number"
                  placeholder="Enter service charge (Rs.)"
                  value={serviceCharge}
                  onChange={(e) => setServiceCharge(e.target.value)}
                  className="bg-black text-yellow-500"
                />
              )}
            </div>

            <Button
              onClick={handleSave}
              className="w-full bg-yellow-500 text-black hover:bg-yellow-600"
            >
              Save Quotation as Image
            </Button>
          </div>

          <div
            ref={quotationRef}
            className="w-full space-y-6 rounded-lg border-2 border-yellow-500 bg-white p-6"
          >
            <h1 className="bg-yellow-500 p-4 text-center text-2xl font-bold text-black">
              {isSale
                ? "Quotation - SALE of Foreign Currency"
                : "Quotation - PURCHASE of Foreign Currency"}
            </h1>

            <div className="space-y-2">
              <div className="bg-green-100 p-2 text-center text-sm">
                For Invoice - Please Furnish: - PASSPORT | PAN of the Traveller
              </div>
              <div className="bg-green-100 p-2 text-center text-sm">
                Tourist VISA | Travel Tickets - (Including Return Tickets)
              </div>
            </div>

            <table className="w-full border-collapse">
              <thead className="bg-yellow-500">
                <tr>
                  <th className={cell}>Currency</th>
                  <th className={cell}>FX Amount</th>
                  <th className={cell}>Rate</th>
                  <th className={cell}>INR Value Rs.</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="bg-yellow-100 text-center">
                    <td className={cell}>{item.currency || "-"}</td>
                    <td className={cell}>{item.amount || "-"}</td>
                    <td className={cell}>{item.rate || "-"}</td>
                    <td className={cell}>{rowInr(item).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <table className="w-full border-collapse">
              <tbody>
                <tr className="bg-yellow-100">
                  <td colSpan={2} className={cell}>
                    Forex INR Total
                  </td>
                  <td className={`${cell} text-right`}>{inr.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className={cell}>{isSale ? "ADD" : "SUBTRACT"}</td>
                  <td className={cell}>GST</td>
                  <td className={`${cell} text-right`}>{gst.toFixed(2)}</td>
                </tr>
                {addService && (
                  <>
                    <tr>
                      <td className={cell}>{isSale ? "ADD" : "SUBTRACT"}</td>
                      <td className={cell}>Service Charge</td>
                      <td className={`${cell} text-right`}>{sc.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className={cell}>{isSale ? "ADD" : "SUBTRACT"}</td>
                      <td className={cell}>GST @ 18% on Service Charge</td>
                      <td className={`${cell} text-right`}>
                        {scGst.toFixed(2)}
                      </td>
                    </tr>
                  </>
                )}
                <tr className="bg-green-100 font-bold">
                  <td colSpan={2} className={cell}>
                    {isSale ? "FINAL PAYABLE AMOUNT" : "FINAL RECEIVABLE AMOUNT"}
                  </td>
                  <td className={`${cell} text-right`}>{final.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            <div className="space-y-2">
              <div className="bg-red-500 p-2 text-center text-white">
                ** Rates are Subject to Change &amp; Availability of Currency **
              </div>
              <div className="bg-blue-500 p-2 text-center text-white">
                ** If bill Amount is more than Rs. 50,000/-, Only Bank Payment
                from the Saving Account of the Passanger is Allowed **
              </div>
              <div className="bg-green-500 p-2 text-center text-white">
                ** Ask for the Bank Details for Bank Transfer **
              </div>
            </div>

            <div className="w-full space-y-2 bg-yellow-500 p-4 text-center">
              <h2 className="font-bold">JUPITER TRADES PRIVATE LIMITED</h2>
              <p className="text-sm">
                Shop No - B-40,Ground Floor, North Ex Mall,Sector-9,
              </p>
              <p className="text-sm">Rohini, Delhi-110085</p>
              <p className="text-sm">
                Mobile No - 9711008182 | Landline : - 011-45517171
              </p>
              <p className="text-sm">
                FFMC License No.- NDL-FFMC-0066-2023 (Valid UP To - 30-04-2028)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
