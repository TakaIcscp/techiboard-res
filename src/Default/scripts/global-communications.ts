import { IProfile, TechboardApi, IMemo } from "./common/api/techboard-api";
import { Session } from "./common/utils/session";

export class GlobalCommunications
{
    public static Profile: KnockoutObservable<IProfile> = ko.observable(null);

    public static isStudent: KnockoutObservable<boolean> = ko.observable(false);
    public static isTeacher: KnockoutObservable<boolean> = ko.observable(false);
    public static isAdmin: KnockoutObservable<boolean> = ko.observable(false);

    public static isMobile: KnockoutObservable<boolean> = ko.observable(false);
    public static windowSize: KnockoutObservable<string> = ko.observable("normal");
    public static _shellInstance: any;
    public static autoCollapse: boolean = true;

    
    // watch window size changes and update what state the project is in
    public static WindowSizeWatcher(): void
    {
        GlobalCommunications.windowSize(window.innerWidth <= 1800 ? "small" : "normal");
        window.addEventListener("resize", (e) =>
        {
            GlobalCommunications.windowSize(window.innerWidth <= 1800 ? "small" : "normal");
        });
    }

    // returns local path from media folder
    public static getLocalFilePath(file): string
    {
       return $$.Root + '/Default/media/' + file;
    }

    // checks if logged in user has a given permission
    public static CanAccess(neededPermission?): boolean
    {
        if (Session.isFeatureEnabled('Admin'))
        {
            return true;
        }
        else if (neededPermission != null && Session.isFeatureEnabled(neededPermission))
        {
            return true;
        }

        return false;
    }

    // checks if current used can access a given group
    public static CanAccessGroup(group: string, ignoreAdmin: boolean): boolean
    {
        if ($$.Session.AccessPermissions.UserGroups.findIndex(x => x == group) != -1)
        {
            return true;
        }
        else if (!ignoreAdmin && Session.isFeatureEnabled('Admin'))
        {
            return true;
        }

        return false;
    }

    public static StartMemoWatch(): void
    {
        return; // in dev
        
        setInterval(() =>
        {
            // is logged in
            if (GlobalCommunications.Profile() != null)
            {
                let data = new TechboardApi().getMemoUnseenList();
                let memos: IMemo[] = data['Memos'];
            }
        }, 10000);
    }
}