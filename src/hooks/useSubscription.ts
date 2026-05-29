import { useCallback, useEffect, useState } from 'react';
import Purchases, { CustomerInfo, PurchasesPackage } from 'react-native-purchases';

const ENTITLEMENT_ID = 'Pedestal: Speech Coach Pro';

export function useSubscription() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkSubscription = useCallback(async () => {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const hasActive = typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
      setIsSubscribed(hasActive);
    } catch {
      setIsSubscribed(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSubscription();

    const listener = (info: CustomerInfo) => {
      const hasActive = typeof info.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
      setIsSubscribed(hasActive);
    };

    Purchases.addCustomerInfoUpdateListener(listener);
    return () => {
      Purchases.removeCustomerInfoUpdateListener(listener);
    };
  }, [checkSubscription]);

  const purchasePackage = useCallback(async (pkg: PurchasesPackage) => {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    const hasActive = typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
    setIsSubscribed(hasActive);
    return hasActive;
  }, []);

  const restorePurchases = useCallback(async () => {
    const customerInfo = await Purchases.restorePurchases();
    const hasActive = typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
    setIsSubscribed(hasActive);
    return hasActive;
  }, []);

  return { isSubscribed, isLoading, purchasePackage, restorePurchases, checkSubscription };
}
