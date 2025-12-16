import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Search, Filter, Download } from "lucide-react";
import { useStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";

export default function Payments() {
  const { transactions } = useStore();
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const filteredTransactions = transactions.filter(t => 
    t.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.transaction_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = () => {
    toast({
      title: "Exporting Report",
      description: "Your transaction report is being generated and will download shortly.",
    });
  };

  const handleFilter = () => {
    toast({
      title: "Filter",
      description: "Filter options would appear here.",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Payments</h1>
            <p className="text-muted-foreground mt-1">View and manage transactions</p>
          </div>
          <Button variant="outline" className="rounded-xl border-primary/20 text-primary hover:bg-primary/5" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" /> Export Report
          </Button>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 flex items-center bg-white p-2 rounded-xl shadow-sm border border-border">
            <Search className="w-4 h-4 text-muted-foreground ml-2" />
            <Input 
              placeholder="Search by user or ID..." 
              className="border-none shadow-none focus-visible:ring-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="rounded-xl h-auto px-4 border-border" onClick={handleFilter}>
            <Filter className="w-4 h-4 mr-2" /> Filter
          </Button>
        </div>

        <div className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((trx) => (
                <TableRow key={trx.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell className="font-mono text-xs font-bold">{trx.transaction_id}</TableCell>
                  <TableCell>{trx.user_name}</TableCell>
                  <TableCell>{trx.product_name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{trx.date}</TableCell>
                  <TableCell className="font-bold">₹{trx.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold
                      ${trx.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                        trx.status === 'Refunded' ? 'bg-red-100 text-red-700' : 
                        'bg-yellow-100 text-yellow-700'}`}>
                      {trx.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}
