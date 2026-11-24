import React, { useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { Activity } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface Order {
  id: string;
  productName?: string;
  shopName?: string;
  price?: string | number;
  status?: string;
  createdAt?: any;
  time?: string;
}

interface MasterChartProps {
  orders: Order[];
  lang: string;
}

export const MasterChart: React.FC<MasterChartProps> = ({ orders, lang }) => {
  const isAr = lang === 'ar';

  const chartData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d;
    });

    return days.map((day) => {
      const dayOrders = orders.filter((o) => {
        let orderDate: Date | null = null;
        if (o.createdAt) {
          if (typeof o.createdAt.toDate === 'function') {
            orderDate = o.createdAt.toDate();
          } else if (o.createdAt.seconds) {
            orderDate = new Date(o.createdAt.seconds * 1000);
          } else {
            orderDate = new Date(o.createdAt);
          }
        } else if (o.time) {
          orderDate = new Date(o.time);
        }

        if (!orderDate || isNaN(orderDate.getTime())) return false;

        return (
          orderDate.getFullYear() === day.getFullYear() &&
          orderDate.getMonth() === day.getMonth() &&
          orderDate.getDate() === day.getDate()
        );
      });

      const label = day.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
        month: 'short',
        day: 'numeric',
      });

      return {
        date: label,
        orderCount: dayOrders.length,
        revenue: dayOrders.reduce((sum, o) => {
          if (!o.price) return sum;
          const parsedStr = String(o.price).replace(/[^\d]/g, '');
          const val = parseInt(parsedStr, 10) || 0;
          return sum + val;
        }, 0),
      };
    });
  }, [orders, isAr]);

  const totalOrdersLast7Days = useMemo(() => {
    return chartData.reduce((sum, d) => sum + d.orderCount, 0);
  }, [chartData]);

  const activeOrdersCount = useMemo(() => {
    return orders.filter((o) => o.status === 'pending' || !o.status).length;
  }, [orders]);

  const acceptedOrdersCount = useMemo(() => {
    return orders.filter((o) => o.status === 'Accepted').length;
  }, [orders]);

  const fontStack = isAr
    ? "'Cairo', 'Plus Jakarta Sans', sans-serif"
    : "'Plus Jakarta Sans', 'Cairo', sans-serif";

  return (
    <div style={{ fontFamily: fontStack }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div>
          <h4
            style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: 700,
              color: '#1E293B',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Activity size={18} color="#2563EB" strokeWidth={2.4} />
            <span>
              {isAr ? 'اتجاهات الطلبات (آخر 7 أيام)' : 'Order Trends (Last 7 Days)'}
            </span>
          </h4>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748B' }}>
            {isAr
              ? 'رصد دقيق لنشاط البيع وطلبات الشراء في الوقت الفعلي'
              : 'Real-time tracking of marketplace transactional activity'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div
            style={{
              background: '#F7F9FC',
              border: '1px solid #E5EBF3',
              borderRadius: '12px',
              padding: '8px 14px',
              textAlign: 'center',
              minWidth: '88px',
            }}
          >
            <div
              style={{
                fontSize: '10px',
                textTransform: 'uppercase',
                color: '#64748B',
                fontWeight: 700,
                letterSpacing: '0.5px',
              }}
            >
              {isAr ? 'إجمالي الأسبوع' : 'WEEK TOTAL'}
            </div>
            <div
              style={{
                fontSize: '18px',
                fontWeight: 800,
                color: '#1E293B',
                marginTop: '2px',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {totalOrdersLast7Days}
            </div>
          </div>
          <div
            style={{
              background: '#FFFBEB',
              border: '1px solid #FDE68A',
              borderRadius: '12px',
              padding: '8px 14px',
              textAlign: 'center',
              minWidth: '88px',
            }}
          >
            <div
              style={{
                fontSize: '10px',
                textTransform: 'uppercase',
                color: '#B45309',
                fontWeight: 700,
                letterSpacing: '0.5px',
              }}
            >
              {isAr ? 'قيد الانتظار' : 'PENDING'}
            </div>
            <div
              style={{
                fontSize: '18px',
                fontWeight: 800,
                color: '#92400E',
                marginTop: '2px',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {activeOrdersCount}
            </div>
          </div>
          <div
            style={{
              background: '#EFF6FF',
              border: '1px solid #BFDBFE',
              borderRadius: '12px',
              padding: '8px 14px',
              textAlign: 'center',
              minWidth: '88px',
            }}
          >
            <div
              style={{
                fontSize: '10px',
                textTransform: 'uppercase',
                color: '#1D4ED8',
                fontWeight: 700,
                letterSpacing: '0.5px',
              }}
            >
              {isAr ? 'المقبولة' : 'ACCEPTED'}
            </div>
            <div
              style={{
                fontSize: '18px',
                fontWeight: 800,
                color: '#1D4ED8',
                marginTop: '2px',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {acceptedOrdersCount}
            </div>
          </div>
        </div>
      </div>

      <div style={{ width: '100%', height: 260, position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.22} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5EBF3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#64748B', fontWeight: 600 }}
              dy={10}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#64748B' }}
              dx={5}
            />
            <Tooltip
              contentStyle={{
                background: '#1E293B',
                border: '1px solid #334155',
                borderRadius: '12px',
                color: '#FFFFFF',
                boxShadow: '0 10px 25px rgba(30, 41, 59, 0.18)',
                fontFamily: fontStack,
                fontSize: '12px',
                padding: '10px 14px',
              }}
              labelStyle={{ fontWeight: 700, marginBottom: '4px', color: '#FFFFFF' }}
              itemStyle={{ color: '#93C5FD', fontWeight: 700, padding: 0 }}
              formatter={(value: any) => [
                `${value} ${isAr ? 'طلبات' : 'orders'}`,
                isAr ? 'عدد الطلبات' : 'Orders',
              ]}
            />
            <Area
              type="monotone"
              dataKey="orderCount"
              stroke="#2563EB"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorOrders)"
              activeDot={{ r: 6, fill: '#2563EB', strokeWidth: 2, stroke: '#fff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

let chartRoot: any = null;

export function updateMasterChart(orders: any[], lang: string) {
  const container = document.getElementById('master-chart-root');
  if (!container) return;

  try {
    if (!chartRoot) {
      chartRoot = createRoot(container);
    }
    chartRoot.render(<MasterChart orders={orders} lang={lang} />);
  } catch (err) {
    console.error('Failed to render Recharts Master Chart:', err);
  }
}

if (typeof window !== 'undefined') {
  (window as any).updateMasterChart = updateMasterChart;
}
