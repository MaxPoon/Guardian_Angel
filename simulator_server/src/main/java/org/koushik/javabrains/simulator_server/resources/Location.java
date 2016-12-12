package org.koushik.javabrains.simulator_server.resources;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

@Path("/location")
public class Location {
	@GET
	@Produces(MediaType.TEXT_PLAIN)
	public String getLocations(){
		return "the location data of each mac address";
	}
}



