<script lang='ts'>
    import { Bar } from 'svelte-chartjs';
    import { Chart, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
    Chart.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);
    import dayjs from 'dayjs';
    export let sales;
    
    $: salesByDayOfWeek = sales.reduce((acc, sale) => {
        const dayOfWeek = dayjs.unix(sale.timestamp).format('dddd');
        acc[dayOfWeek] = (acc[dayOfWeek] || 0) + sale.uiAmount;
        return acc;
    }, {});
    
    $: salesByDayOfWeekData = {
        labels: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        datasets: [{
            label: 'Sales by Day of the Week',
            data: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => salesByDayOfWeek[day] || 0),
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1
        }]
    };
</script>

<div class="card bg-base-100 shadow-xl border">
    <div class="card-body">
        <h2 class="card-title text-xl font-greycliffmed mb-4">Sales by Day of the Week</h2>
        <div class="h-64">
            <Bar data={salesByDayOfWeekData} options={{ maintainAspectRatio: false }} />
        </div>
    </div>
</div>
