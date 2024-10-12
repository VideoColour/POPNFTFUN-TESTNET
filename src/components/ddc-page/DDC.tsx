import Image from 'next/image'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ethers } from "ethers"; 
import { reverseMappingDiamondProperties } from '../../utils/property-mapping';

type DiamondProperties = {
  reportDate?: number
  reportNumber?: string
  shape?: string
  microCarat?: number
  colorGrade?: number
  clarityGrade?: number
  cutGrade?: number
  polishGrade?: number
  symmetryGrade?: number
  fluorescence?: number
  inscriptions?: string
  comments?: string
  source?: string
  measurements?: [number, number, number]
  totalDepth?: number
  tableDiameter?: number
  pavilionDepth?: number
  pavilionAngle?: number
  crownHeight?: number
  crownAngle?: number
  girdlePercentage?: number
}

type NFTProperties = {
  id: string
  creationDateTime: number
  blockchain: string
  mintTransactionId: string
}

const defaultProperties: DiamondProperties = {
  reportDate: Math.floor(new Date('1 Jan 2024 00:00:00 UTC').getTime() / 1000),
  reportNumber: 'IGI-00000000',
  shape: 'Round Brilliant',
  microCarat: 1.01,
  colorGrade: 10,
  clarityGrade: 6,
  cutGrade: 5,
  polishGrade: 5,
  symmetryGrade: 5,
  fluorescence: 1,
  inscriptions: 'I Love You',
  comments: '**SAMPLE**',
  source: 'Natural Diamond',
  measurements: [6.41, 6.43, 3.97],
  totalDepth: 58.9,
  tableDiameter: 67,
  pavilionDepth: 43.5,
  pavilionAngle: 41.9,
  crownHeight: 12,
  crownAngle: 38.5,
  girdlePercentage: 3.7
}

const defaultNFTProperties: NFTProperties = {
  id: 'IGI-00000000',
  creationDateTime: Math.floor(new Date('1 Jan 2024 00:00:00 UTC').getTime() / 1000),
  blockchain: 'zkSync',
  mintTransactionId: '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')
}

const defaultImageLink = "https://4cs.gia.edu/wp-content/uploads/2024/07/02_Cut-GradingScale_960x800.jpg"

export default function DiamondPropertiesComponent({ 
  properties = {}, 
  nftProperties = defaultNFTProperties 
}: { 
  properties?: DiamondProperties,
  nftProperties?: NFTProperties
}) {
  const mergedProperties = { ...defaultProperties, ...properties }

  const mappedProperties = reverseMappingDiamondProperties(
    mergedProperties.colorGrade ?? 0,
    mergedProperties.clarityGrade ?? 0,
    mergedProperties.cutGrade ?? 0,
    mergedProperties.fluorescence ?? 0,
    mergedProperties.polishGrade ?? 0,
    mergedProperties.symmetryGrade ?? 0
  );

  const renderPropertyRow = (key: string, value: any) => (
    <TableRow key={key}>
      <TableCell className="font-light py-1">
        {key.split(/(?=[A-Z])/).join(' ').replace(/^\w/, c => c.toUpperCase())}
      </TableCell>
      <TableCell className="py-1">
        {key === 'measurements' && Array.isArray(value)
          ? value.join(' x ') + ' mm'
          : typeof value === 'number'
          ? value.toFixed(2)
          : value}
      </TableCell>
    </TableRow>
  )

  return (
    <div className="flex flex-col md:flex-row bg-white text-gray-800 font-['Poppins',_sans-serif] gap-4">
      <div className="w-full md:w-1/2 flex flex-col gap-4 order-1 md:order-1">
        <div className="w-full">
          <Image
            src={defaultImageLink}
            alt="Diamond"
            width={500}
            height={500}
            className="w-full h-auto"
          />
        </div>

        <div className="border border-gray-300 p-4 order-3 md:order-2">
          <h2 className="text-2xl font-light mb-4 text-gray-700 pl-2">DDC NFT Properties</h2>
          <Table>
            <TableHeader>

            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="w-1/2 text-left font-bold text-gray-600 py-1">DDC Id</TableCell>
                <TableCell className="w-1/2 text-left font-bold text-gray-600 py-1">{ethers.decodeBytes32String(nftProperties.id)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-light py-1">Creation date / time</TableCell>
                <TableCell className="py-1">
                  {new Date(nftProperties.creationDateTime * 1000).toLocaleString(undefined, {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false,
                    // timeZone: 'UTC',
                    timeZoneName: 'short'
                  })}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-light py-1">Blockchain</TableCell>
                <TableCell className="py-1">{nftProperties.blockchain}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-light py-1">Mint transaction id</TableCell>
                <TableCell className="break-all py-1">{nftProperties.mintTransactionId}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="w-full md:w-1/2 order-2 md:order-2">
        <div className="border border-gray-300 p-4">
          <h2 className="text-2xl font-light mb-4 text-gray-700 pl-2">Diamond Grading Report Data</h2>
          <Table>
            <TableHeader>

            </TableHeader>
            <TableBody>
            <TableRow>
                <TableCell className="w-1/2 text-left font-bold text-gray-600 py-1">Report Id</TableCell>
                <TableCell className="w-1/2 text-left font-bold text-gray-600 py-1">{ethers.decodeBytes32String(nftProperties.id)}</TableCell>
              </TableRow>
              {renderPropertyRow('Carat', Number(mergedProperties.microCarat) / 1000000)}
              {renderPropertyRow('Color', mappedProperties.color)}
              {renderPropertyRow('Clarity', mappedProperties.clarity)}
              {renderPropertyRow('Cut', mappedProperties.cut)}
              {renderPropertyRow('Fluorescence', mappedProperties.fluorescence)}
              {renderPropertyRow('Polish', mappedProperties.polish)}
              {renderPropertyRow('Symmetry', mappedProperties.symmetry)}
              <TableRow>
                <TableCell colSpan={2} className="font-bold pt-3 pb-1">Additional Grading Information</TableCell>
              </TableRow>
              {renderPropertyRow('inscriptions', mergedProperties.inscriptions)}
              {renderPropertyRow('comments', mergedProperties.comments)}

            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}