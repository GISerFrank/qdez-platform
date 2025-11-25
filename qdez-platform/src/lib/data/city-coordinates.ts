// src/lib/data/city-coordinates.ts
// 主要留学城市的经纬度坐标数据库

export interface CityCoordinate {
  lat: number
  lng: number
  country: string
  aliases?: string[]  // 别名，用于模糊匹配
}

/**
 * 城市坐标数据库
 * key格式: "城市名, 国家名" (小写)
 */
export const CITY_COORDINATES: Record<string, CityCoordinate> = {
  // ==========================================
  // 🇺🇸 美国 - United States
  // ==========================================
  
  // 东北部
  "boston, usa": { lat: 42.3601, lng: -71.0589, country: "USA", aliases: ["波士顿"] },
  "boston, us": { lat: 42.3601, lng: -71.0589, country: "USA" },
  "boston, united states": { lat: 42.3601, lng: -71.0589, country: "USA" },
  "cambridge, usa": { lat: 42.3736, lng: -71.1097, country: "USA", aliases: ["剑桥"] },
  "new york, usa": { lat: 40.7128, lng: -74.0060, country: "USA", aliases: ["纽约", "nyc"] },
  "new york city, usa": { lat: 40.7128, lng: -74.0060, country: "USA" },
  "manhattan, usa": { lat: 40.7831, lng: -73.9712, country: "USA" },
  "brooklyn, usa": { lat: 40.6782, lng: -73.9442, country: "USA" },
  "philadelphia, usa": { lat: 39.9526, lng: -75.1652, country: "USA", aliases: ["费城"] },
  "pittsburgh, usa": { lat: 40.4406, lng: -79.9959, country: "USA", aliases: ["匹兹堡"] },
  "providence, usa": { lat: 41.8240, lng: -71.4128, country: "USA" },
  "new haven, usa": { lat: 41.3083, lng: -72.9279, country: "USA" },
  "ithaca, usa": { lat: 42.4440, lng: -76.5019, country: "USA" },
  "princeton, usa": { lat: 40.3573, lng: -74.6672, country: "USA" },
  
  // 西海岸
  "los angeles, usa": { lat: 34.0522, lng: -118.2437, country: "USA", aliases: ["洛杉矶", "la"] },
  "san francisco, usa": { lat: 37.7749, lng: -122.4194, country: "USA", aliases: ["旧金山", "sf"] },
  "san jose, usa": { lat: 37.3382, lng: -121.8863, country: "USA", aliases: ["圣何塞"] },
  "palo alto, usa": { lat: 37.4419, lng: -122.1430, country: "USA" },
  "stanford, usa": { lat: 37.4275, lng: -122.1697, country: "USA" },
  "berkeley, usa": { lat: 37.8716, lng: -122.2727, country: "USA" },
  "san diego, usa": { lat: 32.7157, lng: -117.1611, country: "USA", aliases: ["圣地亚哥"] },
  "seattle, usa": { lat: 47.6062, lng: -122.3321, country: "USA", aliases: ["西雅图"] },
  "portland, usa": { lat: 45.5152, lng: -122.6784, country: "USA", aliases: ["波特兰"] },
  "irvine, usa": { lat: 33.6846, lng: -117.8265, country: "USA" },
  "pasadena, usa": { lat: 34.1478, lng: -118.1445, country: "USA" },
  
  // 中西部
  "chicago, usa": { lat: 41.8781, lng: -87.6298, country: "USA", aliases: ["芝加哥"] },
  "ann arbor, usa": { lat: 42.2808, lng: -83.7430, country: "USA" },
  "madison, usa": { lat: 43.0731, lng: -89.4012, country: "USA" },
  "minneapolis, usa": { lat: 44.9778, lng: -93.2650, country: "USA" },
  "champaign, usa": { lat: 40.1164, lng: -88.2434, country: "USA" },
  "urbana, usa": { lat: 40.1106, lng: -88.2073, country: "USA" },
  "columbus, usa": { lat: 39.9612, lng: -82.9988, country: "USA" },
  "bloomington, usa": { lat: 39.1653, lng: -86.5264, country: "USA" },
  
  // 南部
  "atlanta, usa": { lat: 33.7490, lng: -84.3880, country: "USA", aliases: ["亚特兰大"] },
  "austin, usa": { lat: 30.2672, lng: -97.7431, country: "USA", aliases: ["奥斯汀"] },
  "houston, usa": { lat: 29.7604, lng: -95.3698, country: "USA", aliases: ["休斯顿"] },
  "dallas, usa": { lat: 32.7767, lng: -96.7970, country: "USA", aliases: ["达拉斯"] },
  "durham, usa": { lat: 35.9940, lng: -78.8986, country: "USA" },
  "chapel hill, usa": { lat: 35.9132, lng: -79.0558, country: "USA" },
  "miami, usa": { lat: 25.7617, lng: -80.1918, country: "USA", aliases: ["迈阿密"] },
  "gainesville, usa": { lat: 29.6516, lng: -82.3248, country: "USA" },
  
  // 其他
  "phoenix, usa": { lat: 33.4484, lng: -112.0740, country: "USA", aliases: ["凤凰城"] },
  "tucson, usa": { lat: 32.2226, lng: -110.9747, country: "USA", aliases: ["图森"] },
  "tempe, usa": { lat: 33.4255, lng: -111.9400, country: "USA" },
  "salt lake city, usa": { lat: 40.7608, lng: -111.8910, country: "USA" },
  "boulder, usa": { lat: 40.0150, lng: -105.2705, country: "USA" },
  "denver, usa": { lat: 39.7392, lng: -104.9903, country: "USA", aliases: ["丹佛"] },
  
  // ==========================================
  // 🇬🇧 英国 - United Kingdom
  // ==========================================
  "london, uk": { lat: 51.5074, lng: -0.1278, country: "UK", aliases: ["伦敦"] },
  "london, united kingdom": { lat: 51.5074, lng: -0.1278, country: "UK" },
  "london, england": { lat: 51.5074, lng: -0.1278, country: "UK" },
  "cambridge, uk": { lat: 52.2053, lng: 0.1218, country: "UK", aliases: ["剑桥"] },
  "oxford, uk": { lat: 51.7520, lng: -1.2577, country: "UK", aliases: ["牛津"] },
  "edinburgh, uk": { lat: 55.9533, lng: -3.1883, country: "UK", aliases: ["爱丁堡"] },
  "manchester, uk": { lat: 53.4808, lng: -2.2426, country: "UK", aliases: ["曼彻斯特"] },
  "birmingham, uk": { lat: 52.4862, lng: -1.8904, country: "UK", aliases: ["伯明翰"] },
  "bristol, uk": { lat: 51.4545, lng: -2.5879, country: "UK", aliases: ["布里斯托"] },
  "leeds, uk": { lat: 53.8008, lng: -1.5491, country: "UK", aliases: ["利兹"] },
  "glasgow, uk": { lat: 55.8642, lng: -4.2518, country: "UK", aliases: ["格拉斯哥"] },
  "nottingham, uk": { lat: 52.9548, lng: -1.1581, country: "UK", aliases: ["诺丁汉"] },
  "sheffield, uk": { lat: 53.3811, lng: -1.4701, country: "UK", aliases: ["谢菲尔德"] },
  "southampton, uk": { lat: 50.9097, lng: -1.4044, country: "UK" },
  "bath, uk": { lat: 51.3758, lng: -2.3599, country: "UK", aliases: ["巴斯"] },
  "durham, uk": { lat: 54.7761, lng: -1.5733, country: "UK" },
  "warwick, uk": { lat: 52.2820, lng: -1.5849, country: "UK" },
  "coventry, uk": { lat: 52.4068, lng: -1.5197, country: "UK" },
  
  // ==========================================
  // 🇨🇦 加拿大 - Canada
  // ==========================================
  "toronto, canada": { lat: 43.6532, lng: -79.3832, country: "Canada", aliases: ["多伦多"] },
  "vancouver, canada": { lat: 49.2827, lng: -123.1207, country: "Canada", aliases: ["温哥华"] },
  "montreal, canada": { lat: 45.5017, lng: -73.5673, country: "Canada", aliases: ["蒙特利尔"] },
  "ottawa, canada": { lat: 45.4215, lng: -75.6972, country: "Canada", aliases: ["渥太华"] },
  "waterloo, canada": { lat: 43.4643, lng: -80.5204, country: "Canada" },
  "kingston, canada": { lat: 44.2312, lng: -76.4860, country: "Canada" },
  "edmonton, canada": { lat: 53.5461, lng: -113.4938, country: "Canada" },
  "calgary, canada": { lat: 51.0447, lng: -114.0719, country: "Canada", aliases: ["卡尔加里"] },
  
  // ==========================================
  // 🇦🇺 澳大利亚 - Australia
  // ==========================================
  "sydney, australia": { lat: -33.8688, lng: 151.2093, country: "Australia", aliases: ["悉尼"] },
  "melbourne, australia": { lat: -37.8136, lng: 144.9631, country: "Australia", aliases: ["墨尔本"] },
  "brisbane, australia": { lat: -27.4698, lng: 153.0251, country: "Australia", aliases: ["布里斯班"] },
  "perth, australia": { lat: -31.9505, lng: 115.8605, country: "Australia", aliases: ["珀斯"] },
  "adelaide, australia": { lat: -34.9285, lng: 138.6007, country: "Australia", aliases: ["阿德莱德"] },
  "canberra, australia": { lat: -35.2809, lng: 149.1300, country: "Australia", aliases: ["堪培拉"] },
  
  // ==========================================
  // 🇩🇪 德国 - Germany
  // ==========================================
  "berlin, germany": { lat: 52.5200, lng: 13.4050, country: "Germany", aliases: ["柏林"] },
  "munich, germany": { lat: 48.1351, lng: 11.5820, country: "Germany", aliases: ["慕尼黑"] },
  "frankfurt, germany": { lat: 50.1109, lng: 8.6821, country: "Germany", aliases: ["法兰克福"] },
  "heidelberg, germany": { lat: 49.3988, lng: 8.6724, country: "Germany", aliases: ["海德堡"] },
  "hamburg, germany": { lat: 53.5511, lng: 9.9937, country: "Germany", aliases: ["汉堡"] },
  "cologne, germany": { lat: 50.9375, lng: 6.9603, country: "Germany", aliases: ["科隆"] },
  "aachen, germany": { lat: 50.7753, lng: 6.0839, country: "Germany", aliases: ["亚琛"] },
  
  // ==========================================
  // 🇫🇷 法国 - France
  // ==========================================
  "paris, france": { lat: 48.8566, lng: 2.3522, country: "France", aliases: ["巴黎"] },
  "lyon, france": { lat: 45.7640, lng: 4.8357, country: "France", aliases: ["里昂"] },
  "marseille, france": { lat: 43.2965, lng: 5.3698, country: "France", aliases: ["马赛"] },
  "toulouse, france": { lat: 43.6047, lng: 1.4442, country: "France", aliases: ["图卢兹"] },
  "nice, france": { lat: 43.7102, lng: 7.2620, country: "France", aliases: ["尼斯"] },
  "bordeaux, france": { lat: 44.8378, lng: -0.5792, country: "France", aliases: ["波尔多"] },
  
  // ==========================================
  // 🇯🇵 日本 - Japan
  // ==========================================
  "tokyo, japan": { lat: 35.6762, lng: 139.6503, country: "Japan", aliases: ["东京"] },
  "osaka, japan": { lat: 34.6937, lng: 135.5023, country: "Japan", aliases: ["大阪"] },
  "kyoto, japan": { lat: 35.0116, lng: 135.7681, country: "Japan", aliases: ["京都"] },
  "nagoya, japan": { lat: 35.1815, lng: 136.9066, country: "Japan", aliases: ["名古屋"] },
  "yokohama, japan": { lat: 35.4437, lng: 139.6380, country: "Japan", aliases: ["横滨"] },
  "sendai, japan": { lat: 38.2682, lng: 140.8694, country: "Japan", aliases: ["仙台"] },
  "fukuoka, japan": { lat: 33.5904, lng: 130.4017, country: "Japan", aliases: ["福冈"] },
  "sapporo, japan": { lat: 43.0618, lng: 141.3545, country: "Japan", aliases: ["札幌"] },
  
  // ==========================================
  // 🇸🇬 新加坡 - Singapore
  // ==========================================
  "singapore, singapore": { lat: 1.3521, lng: 103.8198, country: "Singapore", aliases: ["新加坡"] },
  
  // ==========================================
  // 🇭🇰 香港 - Hong Kong
  // ==========================================
  "hong kong, hong kong": { lat: 22.3193, lng: 114.1694, country: "Hong Kong", aliases: ["香港"] },
  "hong kong, china": { lat: 22.3193, lng: 114.1694, country: "Hong Kong" },
  
  // ==========================================
  // 🇳🇱 荷兰 - Netherlands
  // ==========================================
  "amsterdam, netherlands": { lat: 52.3676, lng: 4.9041, country: "Netherlands", aliases: ["阿姆斯特丹"] },
  "rotterdam, netherlands": { lat: 51.9244, lng: 4.4777, country: "Netherlands", aliases: ["鹿特丹"] },
  "delft, netherlands": { lat: 52.0116, lng: 4.3571, country: "Netherlands" },
  "eindhoven, netherlands": { lat: 51.4416, lng: 5.4697, country: "Netherlands" },
  
  // ==========================================
  // 🇨🇭 瑞士 - Switzerland
  // ==========================================
  "zurich, switzerland": { lat: 47.3769, lng: 8.5417, country: "Switzerland", aliases: ["苏黎世"] },
  "geneva, switzerland": { lat: 46.2044, lng: 6.1432, country: "Switzerland", aliases: ["日内瓦"] },
  "lausanne, switzerland": { lat: 46.5197, lng: 6.6323, country: "Switzerland", aliases: ["洛桑"] },
  "basel, switzerland": { lat: 47.5596, lng: 7.5886, country: "Switzerland", aliases: ["巴塞尔"] },
  
  // ==========================================
  // 🇮🇪 爱尔兰 - Ireland
  // ==========================================
  "dublin, ireland": { lat: 53.3498, lng: -6.2603, country: "Ireland", aliases: ["都柏林"] },
  "cork, ireland": { lat: 51.8985, lng: -8.4756, country: "Ireland", aliases: ["科克"] },
  "galway, ireland": { lat: 53.2707, lng: -9.0568, country: "Ireland", aliases: ["高威"] },
  
  // ==========================================
  // 🇰🇷 韩国 - South Korea
  // ==========================================
  "seoul, south korea": { lat: 37.5665, lng: 126.9780, country: "South Korea", aliases: ["首尔"] },
  "busan, south korea": { lat: 35.1796, lng: 129.0756, country: "South Korea", aliases: ["釜山"] },
  "daejeon, south korea": { lat: 36.3504, lng: 127.3845, country: "South Korea", aliases: ["大田"] },
  
  // ==========================================
  // 🇪🇸 西班牙 - Spain
  // ==========================================
  "madrid, spain": { lat: 40.4168, lng: -3.7038, country: "Spain", aliases: ["马德里"] },
  "barcelona, spain": { lat: 41.3874, lng: 2.1686, country: "Spain", aliases: ["巴塞罗那"] },
  
  // ==========================================
  // 🇮🇹 意大利 - Italy
  // ==========================================
  "rome, italy": { lat: 41.9028, lng: 12.4964, country: "Italy", aliases: ["罗马"] },
  "milan, italy": { lat: 45.4642, lng: 9.1900, country: "Italy", aliases: ["米兰"] },
  "florence, italy": { lat: 43.7696, lng: 11.2558, country: "Italy", aliases: ["佛罗伦萨"] },
  
  // ==========================================
  // 🇸🇪 瑞典 - Sweden
  // ==========================================
  "stockholm, sweden": { lat: 59.3293, lng: 18.0686, country: "Sweden", aliases: ["斯德哥尔摩"] },
  "gothenburg, sweden": { lat: 57.7089, lng: 11.9746, country: "Sweden" },
  
  // ==========================================
  // 🇩🇰 丹麦 - Denmark
  // ==========================================
  "copenhagen, denmark": { lat: 55.6761, lng: 12.5683, country: "Denmark", aliases: ["哥本哈根"] },
  
  // ==========================================
  // 🇳🇿 新西兰 - New Zealand
  // ==========================================
  "auckland, new zealand": { lat: -36.8509, lng: 174.7645, country: "New Zealand", aliases: ["奥克兰"] },
  "wellington, new zealand": { lat: -41.2866, lng: 174.7756, country: "New Zealand", aliases: ["惠灵顿"] },
}

/**
 * 国家中心点坐标（兜底使用）
 */
export const COUNTRY_CENTERS: Record<string, { lat: number, lng: number }> = {
  "usa": { lat: 39.8283, lng: -98.5795 },
  "us": { lat: 39.8283, lng: -98.5795 },
  "united states": { lat: 39.8283, lng: -98.5795 },
  "uk": { lat: 55.3781, lng: -3.4360 },
  "united kingdom": { lat: 55.3781, lng: -3.4360 },
  "england": { lat: 52.3555, lng: -1.1743 },
  "canada": { lat: 56.1304, lng: -106.3468 },
  "australia": { lat: -25.2744, lng: 133.7751 },
  "germany": { lat: 51.1657, lng: 10.4515 },
  "france": { lat: 46.2276, lng: 2.2137 },
  "japan": { lat: 36.2048, lng: 138.2529 },
  "singapore": { lat: 1.3521, lng: 103.8198 },
  "hong kong": { lat: 22.3193, lng: 114.1694 },
  "netherlands": { lat: 52.1326, lng: 5.2913 },
  "switzerland": { lat: 46.8182, lng: 8.2275 },
  "ireland": { lat: 53.1424, lng: -7.6921 },
  "south korea": { lat: 35.9078, lng: 127.7669 },
  "korea": { lat: 35.9078, lng: 127.7669 },
  "spain": { lat: 40.4637, lng: -3.7492 },
  "italy": { lat: 41.8719, lng: 12.5674 },
  "sweden": { lat: 60.1282, lng: 18.6435 },
  "denmark": { lat: 56.2639, lng: 9.5018 },
  "new zealand": { lat: -40.9006, lng: 174.8860 },
  "china": { lat: 35.8617, lng: 104.1954 },
}
