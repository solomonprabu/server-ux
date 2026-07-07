/**
 * Copyright 2026 CIT Services
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
 */

import { FormController } from "@web/views/form/form_controller";
import { archiveAccessCache } from "@base_archive_manager/js/archiveAccess";
import { patch } from "@web/core/utils/patch";
import { onWillStart } from "@odoo/owl";

export const getArchiveAccessPatch = () => ({
    setup() {
        super.setup(...arguments);
        this.hasArchiveAccess = false;
        this.hasUnarchiveAccess = false;
        onWillStart(async () => {
            const access = await archiveAccessCache.read(this.props.resModel);
            this.hasArchiveAccess = access.can_archive;
            this.hasUnarchiveAccess = access.can_unarchive;
        });
    },

    getStaticActionMenuItems() {
        const menuItems = super.getStaticActionMenuItems(...arguments);
        
        if (menuItems.archive) {
            const originalArchiveIsAvailable = menuItems.archive.isAvailable;
            menuItems.archive.isAvailable = () => {
                const isAvailable = originalArchiveIsAvailable ? originalArchiveIsAvailable() : true;
                return isAvailable && this.hasArchiveAccess;
            };
        }
        
        if (menuItems.unarchive) {
            const originalUnarchiveIsAvailable = menuItems.unarchive.isAvailable;
            menuItems.unarchive.isAvailable = () => {
                const isAvailable = originalUnarchiveIsAvailable ? originalUnarchiveIsAvailable() : true;
                return isAvailable && this.hasUnarchiveAccess;
            };
        }

        return menuItems;
    }
});

patch(FormController.prototype, getArchiveAccessPatch());