import jade.core.Agent;
import jade.core.behaviours.CyclicBehaviour;
import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.sql.*;
import java.lang.Object;
import jade.core.ProfileImpl;
import jade.core.Runtime;
import jade.wrapper.AgentContainer;
import jade.wrapper.AgentController;
import jade.wrapper.ControllerException;


/**
 * Created by maxpoon on 26/10/16.
 */

public class Simulator{

	public static void main( String args[] ){
		System.out.println("Reading the floorplan");
		int[][] floorplan = readFloorplan();
		try{
			ProfileImpl profileImpl= new ProfileImpl(false);
			profileImpl.setParameter(ProfileImpl.MAIN_HOST, "localhost");
			Runtime runtime = Runtime.instance();
			AgentContainer agentContainer = runtime.createAgentContainer(profileImpl);
			AgentController agentController=agentContainer.createNewAgent("ElderlyAgent",ElderlyAgent.class.getName(), new Object[]{} ); 
			agentController.start();
		}catch (ControllerException e) {
			e.printStackTrace();
		}

	}

	public static class ElderlyAgent extends Agent {
		private int mode;
		private int positionX;
		private int getPositionY;
		private String targetAgent;
		protected void setup(){
			// Object[] args = getArguments();
			String nickname = "Peter";
			System.out.println("Initialize elderly Agent");
			// AID id = newAID(nickname, AID.ISLOCALNAME);
			addBehaviour(new routing());
		}
		protected void takeDown() {
			System.out.println("Agent "+getAID().getName()+" terminating.");
		}
		private class routing extends CyclicBehaviour {
			public void action(){
				while(true){
					System.out.println("hi");
				}
			}
		}
	}

	public static int[][] readFloorplan() {
		try {
			BufferedImage img = ImageIO.read(new File("floorplan.png"));
			int width = img.getWidth();
			int height = img.getHeight();
			int[][] floorplan = new int[height][width];

			//read rgb value
			for (int row = 0; row < height; row++) {
				for (int col = 0; col < width; col++) {
					floorplan[row][col] = img.getRGB(col, row) & 0xFFFFFF;
				}
			}

			//convert rgb into simple representation
			for (int row = 0; row < height; row++) {
				for (int col = 0; col < width; col++) {
					if (floorplan[row][col] < 100) floorplan[row][col] = 0; //black, barrier
					else if(floorplan[row][col] > 16000000) floorplan[row][col] = 1; //white
					else floorplan[row][col] = 2; //green, toilet
				}
			}

			//get the center of each toilet and remove the other green pixel
			for (int row = 0; row < height; row++) {
				for (int col = 0; col < width; col++) {
					if(floorplan[row][col]==2){
						int r = row;
						while(r<height) {
							if (floorplan[r][col] != 2) {
								break;
							} else r++;
						}
						r--;
						int c = col;
						while (c<width){
							if (floorplan[row][c] != 2){
								break;
							}else c++;
						}
						c--;
						if(r==row && c==col) continue;
						int midR = (row + r)/2;
						int midC = (col + c)/2;
						for(int i=row; i<=r; i++){
							for (int j=col; j<=c; j++){
								if((i != midR) || (j != midC)) {
									floorplan[i][j] = 1;
								}
							}
						}
					}
				}
			}

//            for (int row = 0; row < height; row++) {
//                for (int col = 0; col < width; col++) {
//                    System.out.print(floorplan[row][col]);
//                    System.out.print(" ");
//                }
//                System.out.println();
//            }
//            int numOfGreen = 0;
//            for (int row = 0; row < height; row++) {
//                for (int col = 0; col < width; col++) {
//                    if(floorplan[row][col]==2) numOfGreen++;
//                }
//            }
//            System.out.println(numOfGreen);
			return floorplan;
		} catch (IOException e) {
			e.printStackTrace();
		}
		return new int[1][1];

	}
}