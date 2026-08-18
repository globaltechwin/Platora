export interface Booking {
  id: string;
  bookingNo: string;
  date: string;
  siteId: string;
  siteName: string;
  plotCode: string;
  customerName: string;
  mobile: string;
  total: number;
  paid: number;
  balance: number;
  agent: string;
  status: "Confirmed" | "Cancelled";
}

export const mockBookings: Booking[] = [
  {
    id: "1",
    bookingNo: "BK20260005",
    date: "20/06/2026",
    siteId: "1",
    siteName: "ALAPAKKAM",
    plotCode: "B7",
    customerName: "Rajesh",
    mobile: "9999999999",
    total: 333325,
    paid: 50000,
    balance: 283325,
    agent: "Siva",
    status: "Cancelled",
  },
  {
    id: "2",
    bookingNo: "BK20260003",
    date: "09/06/2026",
    siteId: "1",
    siteName: "ALAPAKKAM",
    plotCode: "A7",
    customerName: "Pradeep",
    mobile: "9962614094",
    total: 1039974,
    paid: 30000,
    balance: 1009974,
    agent: "Siva",
    status: "Confirmed",
  },
  {
    id: "3",
    bookingNo: "BK20260002",
    date: "09/06/2026",
    siteId: "1",
    siteName: "ALAPAKKAM",
    plotCode: "A5",
    customerName: "Raja",
    mobile: "9944418662",
    total: 1039974,
    paid: 20000,
    balance: 1019974,
    agent: "-",
    status: "Confirmed",
  },
  {
    id: "4",
    bookingNo: "BK20260001",
    date: "09/06/2026",
    siteId: "1",
    siteName: "ALAPAKKAM",
    plotCode: "A9",
    customerName: "Suresh",
    mobile: "9876543210",
    total: 850000,
    paid: 100000,
    balance: 750000,
    agent: "Ravi",
    status: "Confirmed",
  },
];
