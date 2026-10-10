// Bounding boxes [x0, y0, x1, y1] of each hand/foot/ankle/knee in the artwork's own coordinates, measured from
// react-native-body-highlighter's paths. The realistic style redraws these as smooth shapes inside these boxes.
export type Box = [number, number, number, number];
export type ExtremitySlug = 'hands' | 'feet' | 'ankles' | 'knees';
// prettier-ignore
export const EXTREMITIES: Record<string, Partial<Record<ExtremitySlug, { L: Box; R: Box }>>> = {'male.front':{knees:{L:[267,953,325,1060],R:[403,953,461,1060]},hands:{L:[53,693,150,815],R:[578,693,675,815]},ankles:{L:[270,1208,310,1293],R:[418,1208,458,1293]},feet:{L:[245,1284,308,1340],R:[420,1284,483,1340]}},'male.back':{ankles:{L:[987,1264,1025,1321],R:[1142,1264,1180,1320]},feet:{L:[963,1324,1025,1341],R:[1143,1324,1206,1342]},hands:{L:[773,693,870,815],R:[1297,693,1394,815]}},'female.front':{hands:{L:[6,654,80,766],R:[560,654,635,766]},knees:{L:[240,977,290,1071],R:[351,977,401,1071]},ankles:{L:[255,1298,293,1403],R:[348,1298,386,1403]},feet:{L:[227,1383,293,1428],R:[348,1384,414,1428]}},'female.back':{hands:{L:[828,650,903,760],R:[1383,650,1457,760]},feet:{L:[1065,1362,1117,1428],R:[1168,1362,1221,1428]}}};
