// Copyright (c) 2018, tbtech and contributors
// For license information, please see license.txt

frappe.ui.form.on('Division', {
	division_area: function(frm) 
    {
        if (!frm.doc.division_area) 
        {
            frm.set_value("division_manager", "")
            cur_frm.refersh_field("division_manager")
        }
        // else 
        // {
        //     frm.set_value("division_manager", "") 
        // }
    }

});


