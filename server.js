var express = require("express"),
    app = express();

var fs = require("fs");
var port = process.env.PORT || 8080;

//app.use(express.static(__dirname + '/public'));

// Sample API for testing purposes
app.get('/listILByLocation/:loc', function (req, res) {
   // List available quantities of products at a certain location
	var https = require("https");
	console.log("req.loc is:");
	console.log(req.loc);
    url = "https://<api-key>:<api-password>@<store-name>.myshopify.com/admin/locations/" + req.params.loc + "/inventory_levels.json";

	// get is a simple wrapper for request()
	// which sets the http method to GET
	var request = https.get(url, function (response) {
    	// data is streamed in chunks from the server
    	// so we have to handle the "data" event    
    	var buffer = "", 
        	data,
        	location;

    	response.on("data", function (chunk) {
        	buffer += chunk;
    	}); 

    	response.on("end", function (err) {
        	// finished transferring data
        	// dump the raw data
        	console.log("buffer value:");
        	console.log(buffer);
        	console.log("\n");
        	data = JSON.parse(buffer);
        	

        	// send the finak json back
    		res.send( data );
    	});
    	
	});  
})


app.get('/retrieveIL/:inventory_item_id', function (req, res) {
   // Retirieve Inventory Levels: list available quantities of a single inventory_item_id at the different locations
	var https = require("https");
    url = "https://<api-key>:<api-password>@<store-name>.myshopify.com/admin/inventory_levels.json?inventory_item_ids=" + req.params.inventory_item_id;

	// get is a simple wrapper for request()
	// which sets the http method to GET
	var request = https.get(url, function (response) {
    	// data is streamed in chunks from the server
    	// so we have to handle the "data" event    
    	var buffer = "", 
        	data,
        	location;

    	response.on("data", function (chunk) {
        	buffer += chunk;
    	}); 

    	response.on("end", function (err) {
        	// finished transferring data
        	// dump the raw data
        	data = JSON.parse(buffer);
        	location = data.inventory_levels;
        	console.log("data.inventory_levels = " + location.length);
        	
        	for(var i = 0; i < location.length; i++) {
    			// delete the admin_graphql_api_id element out of json
    			delete location[i].admin_graphql_api_id;
  			}

        	// Now lets get the list of all locations available and add location name, address1, city, postal code, and procinve to the final json
			var url2 = "https://<api-key>:<api-password>@<store-name>.myshopify.com/admin/locations.json"
			var request2 = https.get(url2, function (response2) {
    			// data is streamed in chunks from the server
    			// so we have to handle the "data" event    
    			var buffer2 = "", 
        		data2,
        		location2;

    			response2.on("data", function (chunk) {
        			buffer2 += chunk;
    			}); 

    			response2.on("end", function (err) {
        			data2 = JSON.parse(buffer2);
        			location2 = data2.locations;
        			        			
        			for(var i = 0; i < location.length; i++) {
    					
    					for(var j = 0; j < location2.length; j++) {

							if(location[i].location_id == location2[j].id){
								location[i].name = location2[j].name;
								location[i].address = location2[j].address1;
								location[i].city = location2[j].city;
								location[i].zip = location2[j].zip;
								location[i].province_code = location2[j].province_code;
								break;
							}						
						}    					
  					}        			

        			// send the finak json back
    				res.send( data );
    			});

    		});
        	
    	});
    	
	});  
})



app.get('/checkISA/:productvariant', function (req, res) {
   	// Check In-Store-Availability of a Product Variant: list available quantities of a single product variant
   	// First lets get the inventory_item_id of the product variant
	var https = require("https");
    url = "https://<api-key>:<api-password>@<store-name>.myshopify.com/admin/variants/" + req.params.productvariant + ".json";

	// get is a simple wrapper for request()
	// which sets the http method to GET
	var request = https.get(url, function (response) {
    	// data is streamed in chunks from the server
    	// so we have to handle the "data" event    
    	var buffer = "", 
        	data,
        	inventory_iid;

    	response.on("data", function (chunk) {
        	buffer += chunk;
    	}); 

    	response.on("end", function (err) {
        	// finished transferring data
        	// dump the raw data
        	data = JSON.parse(buffer);
        	inventory_iid = data.variant.inventory_item_id;
        	
			// Now lets use the brought inventory_item_id to get the inventory levels of the product variant
			var url2 = "https://checkinstoreavailability.mybluemix.net/retrieveIL/" + inventory_iid;
			var request2 = https.get(url2, function (response2) {
    			// data is streamed in chunks from the server
    			// so we have to handle the "data" event    
    			var buffer2 = "", 
        		data2;

    			response2.on("data", function (chunk) {
        			buffer2 += chunk;
    			}); 

    			response2.on("end", function (err) {
        			data2 = JSON.parse(buffer2);

        			// send the finak json back
    				res.send( data2 );
    			});

    		});
    	});
    	
	});  
})

app.listen(port);
console.log("Listening on port ", port);
