export class Session {
   public static isFeatureEnabled(feature: string): boolean {
      if (!feature) return true;
      if (!$$.Session) return false;

      let ap = $$.Session.AccessPermissions;

      if (feature.startsWith('virtualg.')) {
         ap = ($$.Session as any).HypeportalAccessPermisssions;
         feature = feature.substring(11);
      }

      if (!ap || !ap.EnabledFeatures) return false;

      return ap.EnabledFeatures.indexOf(feature) >= 0;
   }
}
