package org.sstec.resourceserver;

import java.awt.image.BufferedImage;
import java.awt.image.Kernel;
import java.awt.image.ConvolveOp;

class GaussianFilter {
    private final int radius;
    private final float[] horizontalKernel;
    private final float[] verticalKernel;
    private final ConvolveOp horizontalOp;
    private final ConvolveOp verticalOp;

    public GaussianFilter(int radius) {
        this.radius = Math.max(1, radius);
        this.horizontalKernel = create1DGaussianKernel();
        this.verticalKernel = horizontalKernel; // Same kernel for both directions
        this.horizontalOp = new ConvolveOp(new Kernel(horizontalKernel.length, 1, horizontalKernel), ConvolveOp.EDGE_NO_OP, null);
        this.verticalOp = new ConvolveOp(new Kernel(1, verticalKernel.length, verticalKernel), ConvolveOp.EDGE_NO_OP, null);
    }

    public BufferedImage filter(BufferedImage src, BufferedImage dst) {
        if (dst == null) {
            dst = new BufferedImage(src.getWidth(), src.getHeight(), src.getType());
        }


        // Apply horizontal convolution
        BufferedImage temp = new BufferedImage(src.getWidth(), src.getHeight(), src.getType());
        horizontalOp.filter(src, temp);
        
        // Apply vertical convolution
        verticalOp.filter(temp, dst);
        
        return dst;
    }

    private float[] create1DGaussianKernel() {
        int size = 2 * radius + 1;
        float[] kernel = new float[size];
        float sigma = radius / 3.0f;
        float twoSigmaSquare = 2.0f * sigma * sigma;
        float sigmaRoot = (float) (Math.sqrt(2.0 * Math.PI) * sigma);
        float total = 0;
        int center = size / 2;

        // Calculate kernel values
        for (int i = 0; i < size; i++) {
            float x = i - center;
            kernel[i] = (float) (Math.exp(-(x * x) / twoSigmaSquare) / sigmaRoot);
            total += kernel[i];
        }

        // Normalize kernel
        for (int i = 0; i < size; i++) {
            kernel[i] /= total;
        }

        return kernel;
    }
}
