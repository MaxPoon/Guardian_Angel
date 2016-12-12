package org.koushik.javabrains.simulator_server.resources;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

@Path("/location/multipleRssi")
public class Location_multiple_rssi {
	@GET
	@Produces(MediaType.TEXT_PLAIN)
	public String getLocations(){
		return "10 sets of rssi values within 5 minutes from the booting up of the ";
	}
}