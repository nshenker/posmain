<script lang="ts">
    import { timeClockEvents, employees } from '../stores.js';
    import dayjs from 'dayjs';
    import { exportToCSV } from '../../utils/csv.js';

    export let onBack;

    let payrollStartDate = dayjs().startOf('month').format('YYYY-MM-DD');
    let payrollEndDate = dayjs().endOf('month').format('YYYY-MM-DD');

    const BREAK_EVENTS = ['Start Break', 'Start Lunch'];
    const END_EVENTS = ['End Break', 'End Lunch', 'Clock Out'];

    function calculatePayroll() {
        const events = $timeClockEvents.filter(e => 
            dayjs(e.timestamp).isAfter(dayjs(payrollStartDate).startOf('day').subtract(1, 'second')) &&
            dayjs(e.timestamp).isBefore(dayjs(payrollEndDate).endOf('day').add(1, 'second'))
        ).sort((a, b) => dayjs(a.timestamp).unix() - dayjs(b.timestamp).unix());

        const employeeData = {};
        const employeeMap = new Map($employees.map(e => [e.id, e]));

        for (const emp of $employees) {
            employeeData[emp.id] = {
                name: emp.name,
                rate: emp.hourlyRate || 0,
                totalShiftTimeMs: 0,
                totalBreakTimeMs: 0,
                isClockedIn: false,
                isTakingBreak: false,
                currentShiftStart: null,
                currentBreakStart: null,
            };
        }

        events.forEach(event => {
            const data = employeeData[event.employeeId];
            const timestamp = dayjs(event.timestamp);

            if (!data) return;

            if (event.type === 'Clock In' && !data.isClockedIn) {
                data.isClockedIn = true;
                data.currentShiftStart = timestamp;
            } else if (event.type === 'Clock Out' && data.isClockedIn) {
                data.isClockedIn = false;
                if (data.currentShiftStart) {
                    data.totalShiftTimeMs += timestamp.diff(data.currentShiftStart);
                    data.currentShiftStart = null;
                }
                data.isTakingBreak = false;
                data.currentBreakStart = null;
            } else if (BREAK_EVENTS.includes(event.type) && data.isClockedIn && !data.isTakingBreak) {
                data.isTakingBreak = true;
                data.currentBreakStart = timestamp;
                // Clock out shift time BEFORE break starts
                data.totalShiftTimeMs += timestamp.diff(data.currentShiftStart);
                data.currentShiftStart = null; // Shift is paused
            } else if (END_EVENTS.includes(event.type) && data.isClockedIn && data.isTakingBreak) {
                data.isTakingBreak = false;
                if (data.currentBreakStart) {
                    data.totalBreakTimeMs += timestamp.diff(data.currentBreakStart);
                }
                // Clock in shift time AFTER break ends
                data.currentShiftStart = timestamp;
                data.currentBreakStart = null;
            }
        });

        // Final calculation and handling open shifts (clocking out at end date)
        const reportDateEnd = dayjs(payrollEndDate).endOf('day');
        return Object.values(employeeData).map(data => {
            let finalShiftTimeMs = data.totalShiftTimeMs;
            let finalBreakTimeMs = data.totalBreakTimeMs;
            
            // Handle open shifts/breaks at the end of the report period
            if (data.isClockedIn && data.currentShiftStart) {
                // Shift is open, count time up to report end date
                finalShiftTimeMs += reportDateEnd.diff(data.currentShiftStart);
            } else if (data.isTakingBreak && data.currentBreakStart) {
                // Break is open, count break time up to report end date
                 finalBreakTimeMs += reportDateEnd.diff(data.currentBreakStart);
            }

            const totalNetHours = finalShiftTimeMs / (1000 * 60 * 60);
            const totalBreakHours = finalBreakTimeMs / (1000 * 60 * 60);
            const grossPay = totalNetHours * data.rate;

            return {
                name: data.name,
                rate: data.rate,
                totalNetHours: totalNetHours,
                totalBreakHours: totalBreakHours,
                grossPay: grossPay,
            };
        });
    }

    $: payrollData = calculatePayroll();

    function exportReport() {
        const dataToExport = payrollData.map(data => ({
            'Employee Name': data.name,
            'Hourly Rate': data.rate.toFixed(2),
            'Total Hours Worked': data.totalNetHours.toFixed(2),
            'Total Break Time (Hours)': data.totalBreakHours.toFixed(2),
            'Gross Pay Estimate (USD)': data.grossPay.toFixed(2),
        }));

        exportToCSV(dataToExport, `timeclock_payroll_report_${payrollStartDate}_to_${payrollEndDate}.csv`);
    }
</script>

<div class="card bg-base-100 shadow-xl border">
    <div class="card-body">
        <h2 class="card-title text-2xl font-greycliffmed">Payroll Reports</h2>
        
        <div class="flex flex-wrap gap-4 items-end mb-4 pt-2">
            <div class="form-control">
                <label class="label"><span class="label-text">Start Date</span></label>
                <input type="date" class="input input-bordered" bind:value={payrollStartDate} />
            </div>
            <div class="form-control">
                <label class="label"><span class="label-text">End Date</span></label>
                <input type="date" class="input input-bordered" bind:value={payrollEndDate} />
            </div>
            
            <button class="btn btn-primary" on:click={exportReport} disabled={payrollData.length === 0}>Export Payroll CSV</button>
            <button class="btn btn-ghost" on:click={onBack}>← Back to Time Clock</button>
        </div>

        <div class="divider">Report Summary ({payrollStartDate} to {payrollEndDate})</div>

        <div class="overflow-x-auto">
            <table class="table w-full">
                <thead>
                    <tr>
                        <th>Employee</th>
                        <th class="text-right">Hourly Rate</th>
                        <th class="text-right">Total Net Hours</th>
                        <th class="text-right">Total Break Time</th>
                        <th class="text-right">Gross Pay Estimate (USD)</th>
                    </tr>
                </thead>
                <tbody>
                    {#each payrollData as data (data.name)}
                        <tr>
                            <td class="font-bold">{data.name}</td>
                            <td class="text-right font-mono">${data.rate.toFixed(2)}</td>
                            <td class="text-right font-mono text-success">{data.totalNetHours.toFixed(2)} hrs</td>
                            <td class="text-right font-mono">{data.totalBreakHours.toFixed(2)} hrs</td>
                            <td class="text-right font-mono text-primary">${data.grossPay.toFixed(2)}</td>
                        </tr>
                    {/each}
                    {#if payrollData.length === 0}
                        <tr><td colspan="5" class="text-center py-4">No time clock events found in this date range.</td></tr>
                    {/if}
                </tbody>
            </table>
        </div>
    </div>
</div>
