import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;

/**
 * Created by maxpoon on 12/12/16.
 */
public class Read_floorplan {
    public static void main(String[] args) {
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
        } catch (IOException e) {
            e.printStackTrace();
        }

    }
}
