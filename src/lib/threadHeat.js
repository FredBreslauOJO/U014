const DAY = 86400000;

export function collectThreadDates(childrenMap, rootId, rootDate) {
  const dates = [rootDate];
  const stack = [rootId];
  const seen = new Set();
  while (stack.length) {
    const cur = stack.pop();
    if (seen.has(cur)) continue;
    seen.add(cur);
    (childrenMap[cur] || []).forEach((c) => {
      dates.push(c.created_date);
      stack.push(c.id);
    });
  }
  return dates;
}

export function computeHeat(dates) {
  if (!dates || !dates.length) return 0;
  const now = Date.now();
  const ages = dates.map((d) => (now - new Date(d).getTime()) / DAY);
  const recent1 = ages.filter((a) => a <= 1).length;
  const recent3 = ages.filter((a) => a <= 3).length;
  const dayBuckets = new Set();
  ages.forEach((a) => { if (a <= 2) dayBuckets.add(Math.floor(a)); });
  const distinctDaysLast2 = dayBuckets.size;
  const total = dates.length;

  if (recent1 >= 4 || (total >= 6 && recent1 >= 1)) return 3;
  if (distinctDaysLast2 >= 2) return 2;
  if (recent3 >= 1) return 1;
  return 0;
}