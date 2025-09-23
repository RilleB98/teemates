# iOS Setup för In-App Purchase

## Nödvändiga steg i Xcode:

### 1. Lägg till Info.plist-inställningar
Lägg till följande i `ios/App/App/Info.plist`:

```xml
<!-- Enable StoreKit for In-App Purchases -->
<key>SKStoreKitServiceEnabled</key>
<true/>
```

### 2. Uppdatera Entitlements
Lägg till följande i både `TeeMates.entitlements` och `TeeMatesDebug.entitlements`:

```xml
<!-- In-App Purchase capability -->
<key>com.apple.developer.in-app-purchases</key>
<true/>
```

### 3. Rensa duplicerat innehåll
Ta bort följande filer från Xcode:
- `AuthViewModel-2.swift`
- `ContentView-2.swift` 
- `MainView-2.swift`
- `SupabaseClient-2.swift`
- `SupabaseClientManager-2.swift`
- `SupabaseManager-2.swift`
- `TeeMatesApp-2.swift`

### 4. RevenueCat Setup
1. Skapa konto på [RevenueCat](https://app.revenuecat.com)
2. Lägg till din iOS app med Bundle ID: `app.lovable.c3a7dfcdab3b42b0ace67b83101e3118`
3. Konfigurera produkter i App Store Connect
4. Koppla produkterna till RevenueCat
5. Ersätt `YOUR_REVENUECAT_API_KEY` i `src/services/purchaseService.ts`

### 5. App Store Connect Setup
1. Gå till App Store Connect
2. Lägg till In-App Purchase produkter:
   - Produkt ID: `premium_monthly`
   - Typ: Auto-renewable subscription
   - Pris: 59 SEK/månad

### 6. Testa köpflödet
1. Kör `npx cap sync ios`
2. Öppna projektet i Xcode
3. Använd Sandbox-konto för testning
4. Testa köp och återställning av köp

## Nästa steg:
Efter att du har slutfört iOS-setupen kan du testa In-App Purchase-funktionaliteten i appen.