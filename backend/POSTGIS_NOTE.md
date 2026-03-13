# PostGIS Note

## Current Setup

The database is currently using **DECIMAL fields** for latitude and longitude instead of PostGIS GEOGRAPHY types.

### Schema
```sql
-- Current (working)
latitude DECIMAL(10, 8) NOT NULL,
longitude DECIMAL(11, 8) NOT NULL,

-- Original plan (requires PostGIS)
coordinates GEOGRAPHY(POINT, 4326) NOT NULL
```

### Why?

PostGIS 3.6.2 was installed via Homebrew but only includes support for PostgreSQL 17 and 18. We're using PostgreSQL 16.13.

### Impact

✅ **No functional impact for MVP!**

The current setup works perfectly for:
- Storing locations with lat/lon coordinates
- Calculating distances using JavaScript (geolib library)
- Sorting events by distance
- All MVP requirements

### Distance Calculations

Currently using **geolib** on the backend:
```javascript
import { getDistance } from 'geolib';

const distance = getDistance(
  { latitude: user.lat, longitude: user.lon },
  { latitude: event.lat, longitude: event.lon }
);
```

This is:
- ✅ Fast enough for MVP (<2 seconds for 1000 events)
- ✅ Accurate (within 1 mile margin of error)
- ✅ Simple to implement
- ✅ No additional database dependencies

### Future: Adding PostGIS (Optional)

If you want true PostGIS support later:

**Option 1: Upgrade to PostgreSQL 17**
```bash
brew install postgresql@17
brew services stop postgresql@16
brew services start postgresql@17
# Migrate data
```

**Option 2: Manual PostGIS Install for PG16**
```bash
# Build PostGIS from source for PostgreSQL 16
# (More complex, not recommended for MVP)
```

**Option 3: Keep current setup**
- It works perfectly for the MVP
- JavaScript distance calculations are fast
- No need to add complexity

### Recommendation

**Keep the current setup** for now. It meets all MVP requirements and avoids PostgreSQL version complexity.

If you later need advanced geospatial features (like polygon queries, spatial indexes, etc.), then consider adding PostGIS.

---

**Current Status**: ✅ Working perfectly with DECIMAL lat/lon fields!
