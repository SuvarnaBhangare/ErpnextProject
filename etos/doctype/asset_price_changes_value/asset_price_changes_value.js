// Copyright (c) 2018, tbtech and contributors
// For license information, please see license.txt

frappe.ui.form.on("Asset Price Changes Value", "refresh", function(frm) {
    cur_frm.set_query("asset", function() {
        return {
            "filters": {
                "status": "Submitted"
            }
        };
    });
});

frappe.ui.form.on('Asset Price Changes Value', {

	asset: function(frm) 
	{
		if (cur_frm.doc.asset) 
        {

		// console.log("hi");
		frappe.call({ 
			method:"get_sql",
			doc:cur_frm.doc,
			args:{	},
			callback: function (r){
				console.log(r);
				var data = r.message
		if(data)
		{
			// console.log(data);
			cur_frm.set_value("current_daily_cost", data[0].cst);
			cur_frm.set_value("current_daily_rate", data[0].rt);
		}
	}
	});

        }
        else 
        {
           
			frm.set_value("current_daily_cost", "");
			frm.set_value("current_daily_rate", "");
        }
	}
});


