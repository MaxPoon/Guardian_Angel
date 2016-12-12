package org.koushik.javabrains.simulator_server.resources;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

@Path("/location/rssi")
public class Location_rssi {
	@GET
	@Produces(MediaType.TEXT_PLAIN)
	public String getLocations(){
		return "the mean rssi of each beacon from each sniffer";
	}
}
